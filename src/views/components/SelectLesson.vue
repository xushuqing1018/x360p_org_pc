<template>
    <div :class="classes">
        <div @click="openModal">
            <slot>
                <div
                    :class="[prefixCls + '-selection']"
                    ref="reference">
                    <span :class="[prefixCls + '-placeholder']" v-show="showPlaceholder">{{ localePlaceholder }}</span>
                    <span :class="[prefixCls + '-selected-value']" v-show="!showPlaceholder">{{ labelText }}</span>
                    <Icon type="ios-close" :class="[prefixCls + '-arrow']" v-if="showCloseIcon" @click.native.stop="clearSelected"></Icon>
                    <Icon type="arrow-down-b" :class="[prefixCls + '-arrow']"></Icon>
                </div>
            </slot>
        </div>
    </div>
</template>
<script>
import { oneOf, findComponentDownward } from '@/libs/assist';
import store from '@/store'
import util from  '@/libs/util'
import common from '@/libs/common.mixin'

const prefixCls = 'ivu-select'
const resName   = 'lesson'
const idField   = 'lid'
const textField = 'lesson_name'
const recordName = '课程'
const unit       = '门'

export default {
        name: 'SelectLesson',
        mixins: [ common ],
        props: {
            value: {
                type: [String, Number, Array],
                default: ''
            },
            disabled: {
                type: Boolean,
                default: false
            },
            readonly:{
                type:Boolean,
                default:false
            },
            condition: {
                type: Object,
                default() {
                    return {
                        lesson_type: [0,1,2,3]
                    }
                }
            },
            allowType:{
                type:Array,
                default(){
                    return [0,1,2,3]
                }
            },
            clearable: {
                type: Boolean,
                default: true
            },
            placeholder: {
                type: String
            },
            loading: {
                type: Boolean,
                default: false
            },
            loadingText: {
                type: String
            },
            size: {
                validator (value) {
                    return oneOf(value, ['small', 'large', 'default']);
                }
            },
            notFoundText: {
                type: String
            },
            placement: {
                validator (value) {
                    return oneOf(value, ['top', 'bottom']);
                },
                default: 'bottom'
            },
            isDemo: {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                prefixCls: prefixCls,
                modalShow: false,
                options: [],
                optionInstances: [],
                labelText:'',
                model: this.value
            };
        },
        computed: {
            modalWidth(){
                if(this.multiple){
                    return '900'
                }
                return '640'
            },
            multiple(){
                if(Array.isArray(this.model)){
                    return true
                }
                return false
            },
            classes () {
                return [
                    `${prefixCls}`,
                    {
                        [`${prefixCls}-visible`]: this.visible,
                        [`${prefixCls}-disabled`]: this.disabled,
                        [`${prefixCls}-multiple`]: this.multiple,
                        [`${prefixCls}-single`]: !this.multiple,
                        [`${prefixCls}-show-clear`]: this.showCloseIcon,
                        [`${prefixCls}-${this.size}`]: !!this.size
                    }
                ];
            },
            showPlaceholder () {
                let status = false;

                if ((typeof this.model) === 'string') {
                    if (this.model === '' || this.model === '0') {
                        status = true;
                    }
                } else if (Array.isArray(this.model)) {
                    if (!this.model.length) {
                        status = true;
                    }
                } else if((typeof this.model) === 'number'){

                    if(this.model == 0){
                        status = true;
                    }
                } else if( this.model === null){
                    status = true;
                }

                return status;
            },
            localePlaceholder () {
                if (this.placeholder === undefined) {
                    return '请选择';
                } else {
                    return this.placeholder;
                }
            },
            showCloseIcon () {
                return  this.clearable && !this.showPlaceholder && !this.disabled;
            },
            
            
        },
        methods: {
            openModal() {
                if(this.disabled) {
                    return false
                }
                this.openMyModal()
            },
            openMyModal(){
                this.$Modal.open('components/SelectLessonModal.vue@modal',{
                    props:{
                        multiple:this.multiple,
                        selected:this.model,
                        width:this.modalWidth,
                        condition:this.condition,
                        'is-demo-extra':this.isDemo,
                        'allow-type':this.allowType
                    },
                    on:{
                        'on-select':(e)=>{
                            this.updateSelected(e)
                        }
                    }
                }).then(modal=>{
                    modal.show()
                })
            },
            updateSelected(selected){
                if(this.multiple){
                    if(this.model.length > 0){
                        this.model.splice(0,this.model.length)
                    }
                    selected.forEach(item=>{
                        this.model.push(item[idField])
                    })
                }else{
                    this.model = selected[idField]
                }
                this.updateLabelText()
                this.$emit('input',this.model)
                this.$emit('selected',selected)
                this.dispatch('FormItem', 'on-form-change', this.model);
            },
            updateLabelText(){
                if(this.multiple){
                    if(this.model.length > 0 && this.model[0] > 0){
                        this.$store.dispatch('getMapText',{
                            id:this.model[0],
                            name:resName,
                            idf:idField,
                            txf:textField
                        }).then(text=>{
                            let txt = text
                            if(this.model.length > 1){
                                txt += '等'+this.model.length+unit+recordName
                            }
                            this.labelText = txt
                        })
                    }else{
                        this.labelText = ''
                    }   
                }else{
                    if(this.model){
                        this.$store.dispatch('getMapText',{
                            id:this.model,
                            name:resName,
                            idf:idField,
                            txf:textField
                        }).then(text=>{
                            this.labelText = text
                        })
                      
                    }else{
                       this.labelText = ''
                    }
                }
            },
            clearSelected () {
                if (this.multiple) {
                    if(this.model.length > 0){
                        this.model.splice(0,this.model.length)
                    }
                }else{
                    this.model = 0
                }
                this.$emit('input',this.model)
                this.$emit('on-clear')
            }
        },
        created(){
            this.model = this.value
            if(!this.showPlaceholder){
                this.updateLabelText()
            }
        },
        mounted () {

        },
        watch: {
            value (val) {
                this.model = val;
                this.updateLabelText()
            }
        }
    };
</script>