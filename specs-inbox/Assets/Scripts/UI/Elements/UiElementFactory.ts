// UiElementFactory owns shared Lens Studio UI element construction for InboxHudController.
//
// Learning goal:
// InboxHudController should decide which panels and states to render. This helper keeps the
// repeated low-level scene-object, text, icon, frame, and hit-area setup in one
// focused place so panel builders stay easier to read.

import { Frame } from 'SpectaclesUIKit.lspkg/Scripts/Components/Frame/Frame';
import { BackPlate } from 'SpectaclesUIKit.lspkg/Scripts/BackPlate';
import { RoundedRectangle } from 'SpectaclesUIKit.lspkg/Scripts/Visuals/RoundedRectangle/RoundedRectangle';
import { Interactable } from 'SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable';
import { InteractorEvent } from 'SpectaclesInteractionKit.lspkg/Core/Interactor/InteractorEvent';
import * as HudLayoutConfig from '../HudLayoutConfig';

type ButtonFeedbackState = 'default' | 'hover' | 'trigger';

export class UiElementFactory {
  // Adds the shared UIKit frame around both panels.
  addPanelFrame(panelRoot: SceneObject): void {
    const frame = panelRoot.createComponent(Frame.getTypeName()) as Frame;
    frame.autoShowHide = false;
    frame.autoScaleContent = false;
    (frame as any).allowScaling = false;  // private in older UIKit types — safe at runtime
    (frame as any)._innerSize = new vec2(HudLayoutConfig.PANEL_W, HudLayoutConfig.PANEL_H);
  }

  // Small scene-object factory used by all builders so parenting and positioning
  // happen the same way everywhere.
  createObject(parent: SceneObject, name: string, position?: vec3): SceneObject {
    const obj = global.scene.createSceneObject(name);
    obj.setParent(parent);
    if (position) obj.getTransform().setLocalPosition(position);
    return obj;
  }

  // Creates Lens Studio Text with the shared rendering settings used by this HUD.
  addText(parent: SceneObject, value: string, size: number,
      pos: vec3, color: vec4): Text {
    const textObj = this.createObject(parent, 'Text', pos);
    const text = textObj.createComponent('Component.Text') as Text;
    text.text = value;
    text.size = size;
    text.textFill.mode = TextFillMode.Solid;
    text.textFill.color = color;
    text.depthTest = true;
    text.horizontalOverflow = HorizontalOverflow.Overflow;
    return text;
  }

  // Creates an Image component using a cloned material so each icon can have
  // its own texture without changing the shared source material asset.
  addIcon(parent: SceneObject, texture: Texture, sizeCm: number, pos: vec3, flipX: boolean = false): Material {
    const imageObj = this.createObject(parent, 'Icon', new vec3(pos.x, pos.y, pos.z + HudLayoutConfig.ICON_Z_LIFT));
    const image = imageObj.createComponent('Component.Image') as Image;
    image.flipX = flipX;
    const material = HudLayoutConfig.IMAGE_MAT.clone() as Material;
    material.mainPass.baseTex = texture;
    material.mainPass.baseColor = HudLayoutConfig.COLOR_BUTTON_DEFAULT;
    material.mainPass.depthTest = true;
    material.mainPass.depthWrite = false;
    image.clearMaterials();
    image.addMaterial(material);
    imageObj.getTransform().setLocalScale(new vec3(sizeCm, sizeCm, 1));
    return material;
  }

  // A tappable icon button: icon + Interactable + box physics trigger
  // plus small hover/press feedback for Spectacles interaction clarity.
  addTapButton(parent: SceneObject, texture: Texture, iconSize: number,
      pos: vec3, hitW: number, hitH: number, onTap: () => void, onHover?: () => void, flipX: boolean = false): SceneObject {
    const root = this.createObject(parent, 'Btn', pos);
    const plate = this.addButtonPlate(root, hitW * 0.75, hitH * 0.75);
    const material = this.addIcon(root, texture, iconSize, new vec3(0, 0, 0), flipX);
    const interactable = this.addHitArea(root, hitW, hitH, onTap);
    this.bindButtonFeedback(root, pos, material, plate, interactable, onHover);
    return root;
  }

  // Creates the soft rounded background behind shared icon buttons so they read
  // as tappable controls, matching the inbox row plate style.
  private addButtonPlate(parent: SceneObject, width: number, height: number): RoundedRectangle {
    const plateObj = this.createObject(parent, 'ButtonPlate', new vec3(0, 0, -0.04));
    const plate = plateObj.createComponent(RoundedRectangle.getTypeName()) as RoundedRectangle;
    plate.size = new vec2(width, height);
    plate.cornerRadius = HudLayoutConfig.BUTTON_PLATE_CORNER_RADIUS;
    plate.gradient = false;
    plate.backgroundColor = HudLayoutConfig.COLOR_BUTTON_PLATE_DEFAULT;
    plate.initialize();
    return plate;
  }


  // Connects SIK hover/trigger events to lightweight icon-button visual feedback.
  private bindButtonFeedback(root: SceneObject, basePosition: vec3, material: Material, plate: RoundedRectangle, interactable: Interactable, onHover?: () => void): void {
    let isHovered = false;

    interactable.onHoverEnter.add((_e: InteractorEvent) => {
      isHovered = true;
      this.setButtonFeedback(root, basePosition, material, plate, 'hover');
      if (onHover) onHover();
    });
    interactable.onHoverExit.add((_e: InteractorEvent) => {
      isHovered = false;
      this.setButtonFeedback(root, basePosition, material, plate, 'default');
    });
    interactable.onTriggerStart.add((_e: InteractorEvent) => {
      this.setButtonFeedback(root, basePosition, material, plate, 'trigger');
    });
    interactable.onTriggerEnd.add((_e: InteractorEvent) => {
      this.setButtonFeedback(root, basePosition, material, plate, isHovered ? 'hover' : 'default');
    });
    interactable.onTriggerEndOutside.add((_e: InteractorEvent) => {
      this.setButtonFeedback(root, basePosition, material, plate, 'default');
    });
    interactable.onTriggerCanceled.add((_e: InteractorEvent) => {
      this.setButtonFeedback(root, basePosition, material, plate, 'default');
    });
  }

  // Applies button hover/press position, scale, and tint without changing the tap callback.
  private setButtonFeedback(root: SceneObject, basePosition: vec3, material: Material, plate: RoundedRectangle, state: ButtonFeedbackState): void {
    const offset = state === 'trigger'
      ? HudLayoutConfig.BUTTON_TRIGGER_OFFSET
      : (state === 'hover' ? HudLayoutConfig.BUTTON_HOVER_OFFSET : new vec3(0, 0, 0));
    const scale = state === 'trigger'
      ? HudLayoutConfig.BUTTON_TRIGGER_SCALE
      : (state === 'hover' ? HudLayoutConfig.BUTTON_HOVER_SCALE : HudLayoutConfig.BUTTON_DEFAULT_SCALE);
    const color = state === 'trigger'
      ? HudLayoutConfig.COLOR_BUTTON_TRIGGER
      : (state === 'hover' ? HudLayoutConfig.COLOR_BUTTON_HOVER : HudLayoutConfig.COLOR_BUTTON_DEFAULT);
    const plateColor = state === 'trigger'
      ? HudLayoutConfig.COLOR_BUTTON_PLATE_TRIGGER
      : (state === 'hover' ? HudLayoutConfig.COLOR_BUTTON_PLATE_HOVER : HudLayoutConfig.COLOR_BUTTON_PLATE_DEFAULT);

    root.getTransform().setLocalPosition(new vec3(
      basePosition.x + offset.x,
      basePosition.y + offset.y,
      basePosition.z + offset.z
    ));
    root.getTransform().setLocalScale(scale);
    material.mainPass.baseColor = color;
    plate.backgroundColor = plateColor;
  }


  // Creates a decorative rounded rectangle plate behind grouped detail text.
  addContentPlate(parent: SceneObject, name: string, size: vec2, position: vec3, color: vec4, cornerRadius: number): RoundedRectangle {
    const plateObj = this.createObject(parent, name, position);
    const plate = plateObj.createComponent(RoundedRectangle.getTypeName()) as RoundedRectangle;
    plate.size = size;
    plate.cornerRadius = cornerRadius;
    plate.gradient = false;
    plate.backgroundColor = color;
    plate.initialize();
    return plate;
  }

  // Adds a shared status-style BackPlate sized by the caller.
  addBackPlate(parent: SceneObject, size: vec2): BackPlate {
    const backPlate = parent.createComponent(BackPlate.getTypeName()) as BackPlate;
    (backPlate as any).size = size;
    return backPlate;
  }

  // SIK Interactable + Physics box trigger — compatible with 2024 and 2027 Specs.
  addHitArea(obj: SceneObject, w: number, h: number, onTap: () => void): Interactable {
    // Collider must be created before Interactable because SIK scans on Interactable registration.
    const collider = obj.createComponent('Physics.ColliderComponent') as ColliderComponent;
    const box = Shape.createBoxShape();
    box.size = new vec3(w, h, 1);
    collider.shape = box;

    const interactable = obj.createComponent(Interactable.getTypeName()) as Interactable;
    interactable.onTriggerEnd.add((_e: InteractorEvent) => { onTap(); });
    return interactable;
  }

  // Gives detail text fixed layout bounds so long lines wrap or ellipsize
  // inside the panel instead of drawing over the frame edges.
  setTextBounds(text: Text, width: number, height: number,
      horizontalOverflow: HorizontalOverflow, verticalOverflow: VerticalOverflow,
      lineSpacing: number = 1): void {
    text.worldSpaceRect = Rect.create(0, width, -height, 0);
    text.horizontalAlignment = HorizontalAlignment.Left;
    text.verticalAlignment = VerticalAlignment.Top;
    text.horizontalOverflow = horizontalOverflow;
    text.verticalOverflow = verticalOverflow;
    text.lineSpacing = lineSpacing;
  }
}
