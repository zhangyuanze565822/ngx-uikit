import {ChangeDetectionStrategy, Component, EventEmitter, forwardRef, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {NkRadioOption} from '../core/type/nk-types';
import {isEmpty, isNil, isNotNil} from '../core/util/nk-util';
import {BehaviorSubject} from 'rxjs';
import {debounceTime, filter} from 'rxjs/operators';
import {NkRadioDirective} from './nk-radio.directive';

/**
 * nk-radio容器,可以访问子节点的nk-radio
 *
 */
@Component({
  selector: 'nk-radio-container',
  template: '<ng-content></ng-content>',
  exportAs: 'nkRadioContainer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NkRadioContainerComponent),
      multi: true
    }
  ]
})
export class NkRadioContainerComponent implements OnInit, ControlValueAccessor {
  /**
   * ngModel绑定的值,该值通过valueFormat转换后获得
   * 选中状态设置为NkValue,否则设置为null,为了适应表单的required
   */
    // tslint:disable-next-line
  modelValue: any = null;

  /**
   * 触发ngModelChange的同时触发该事件,当所有复选框都没被选中时返回空数组
   */
  @Output() nkOnChange = new EventEmitter<NkRadioOption>();
  /**
   * 复选框点击事件
   * 触发该事件时,并不能正确判断checked状态
   * 要获取正确的checked状态,请使用nkItemChange
   */
  @Output() nkOnItemClick = new EventEmitter<{nkOption: NkRadioOption, clickEvent: MouseEvent}>();

  /**
   * 所有子节点的checkbox
   */
  _childrenNodes: NkRadioDirective[] = [];
  /**
   * 注册子组件
   */
  _childrenRegister = new BehaviorSubject<NkRadioDirective | null>(null);
  _prevChecked?: NkRadioDirective;
  _onChange = (_: object | null) => { };
  _onTouched = () => { };

  constructor() { }

  ngOnInit(): void {
    this._childrenRegister
      .pipe(filter(it => isNotNil(it)), debounceTime(60))
      .subscribe(node => {
        // tslint:disable-next-line:no-any
        this.updateChildrenCheckedState(node as NkRadioDirective);
      });
  }

  registerOnChange(fn: (_: object | null) => { }): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this._onTouched = fn;
  }

  // tslint:disable-next-line
  writeValue(value: any): void {
    this.modelValue = isNil(value) ? null : value;
    this.updateChildrenCheckedState();
  }

  updateChildrenCheckedState(node?: NkRadioDirective): void {
    if (this._prevChecked && this._prevChecked === node) {
      this._prevChecked.setCheckedState(node.compareWith(this.modelValue, node.nkValue));
      return;
    }

    if (this._prevChecked) {
      this._prevChecked.setCheckedState(false);
    }

    if (node) {
      node.setCheckedState(node.compareWith(this.modelValue, node.nkValue));
      this._prevChecked = node;
      return;
    }

    if (isEmpty(this._childrenNodes)) {
      return ;
    }

    this._childrenNodes.forEach(ck => {
      const checked = ck.compareWith(this.modelValue, ck.nkValue);
      ck.setCheckedState(checked);
      if (checked) {
        this._prevChecked = ck;
        return false;
      }
      return true;
    });
  }

  /**
   * 更新ngModel的值
   * @param node 当前节点
   * @param emit 是否发布ngModelChange事件
   */
  updateModelValue(node: NkRadioDirective, emit: boolean = true, ): void {
    this.updateChildrenCheckedState(node);
    if (emit) {
      this._onChange(this.modelValue);
    }
    this.nkOnChange.emit(this._childToNkRadioOption(node));
  }

  /**
   * 子节点checkbox注册到该容
   * @param node 节点checkbox
   */
  registerChild(node: NkRadioDirective): void {
    this._childrenNodes.push(node);
    this._childrenRegister.next(node);

    // @ts-ignore
    node.nkOnChange.subscribe(childValue => {
      this.modelValue = isEmpty(childValue) ? null : childValue;
      this.updateModelValue(node);
    });
  }

  /**
   * 把NkRadioDirective转换为NkRadioOption
   * @param node NkRadioDirective
   */
  private _childToNkRadioOption(node: NkRadioDirective): NkRadioOption {
    return {
      nkValue: node.nkValue,
      nkChecked: node.nkValue !== null,
      nkLabel: node.nkLabel,
      nkDisabled: node.nkDisabled,
    } as NkRadioOption;
  }

  /**
   * 删除子节点的NkRadioDirective
   * @param child 子节点的NkRadioDirective
   */
  removeChild(child: NkRadioDirective): boolean {
    if (this._prevChecked === child) {
      this._prevChecked = undefined;
    }
    const index = this._childrenNodes.indexOf(child);
    if (index > -1) {
      this._childrenNodes.splice(index, 1);
      return true;
    }
    return false;
  }
}