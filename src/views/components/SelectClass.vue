<template>
    <div :class="classes">
        <div @click="openModal">
            <slot>
                <div
                    :class="[prefixCls + '-selection']"
                    ref="reference"
                    >
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
const resName   = 'class'
const idField   = 'cid'
const textField = 'class_name'
const recordName = '班级'
const unit       = '个'

export default {
        name: 'SelectClass',
        mixins: [common],
        props: {
            value: {
                type: [String, Number, Array],
                default: ''
            },           
            disabled: {
                type: Boolean,
                default: false
            },
            clearable: {
                type: Boolean,
                default: false
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
                type: String,
                default: '没有找到班级'
            },
            placement: {
                validator (value) {
                    return oneOf(value, ['top', 'bottom']);
                },
                default: 'bottom'
            },
            url: {
                type: String,
                default: 'search/classes'
            },
            disabledTemp: {
                type: Boolean,
                default: false
            },
            isDemo: {
                type: Number,
                default: 0
            }
        },
        data () {
            return {
                prefixCls: prefixCls,
                modalShow: false,
                options: [],
                optionInstances: [],
                labelText:'',
                model: this.value,
                type:'all'
            };
        },
        computed: {
            modalWidth(){
                if(this.multiple){
                    return '900'
                }
                return '750'
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
                return  this.clearable && !this.showPlaceholder;
            },
            checkAll() {
                if(this.perCheckAllClass) {
                    if(this.type=='all') {
                        return true
                    }else{
                        return false
                    }
                }else{
                    return false
                }
            },
            checkMy() {
                if(this.perCheckAllClass) {
                    if(this.type=='my') {
                        return true
                    }else{
                        return false
                    }
                }else{
                    return true
                }
            }
        },
        methods: {
            checkClass(type) {
                this.type = type
                this.openModal()
            },
            openModal() {
                if(this.disabled) {
                    return false
                }
                if(this.checkAll){
                    this.openAllModal()
                }else{
                    this.openMyModal()
                }
            },
            openAllModal(){
                this.$Modal.open('components/SelectClassModal.vue@modal',{
                    props:{
                        multiple:this.multiple,
                        selected:this.model,
                        width:this.modalWidth,
                        url:this.url,
                        notFoundText:this.notFoundText,
                        'disabled-temp':this.disabledTemp,
                        'is-demo-extra':this.isDemo
                    },
                    on:{
                        'on-select':(e)=>{
                            this.updateSelected(e)
                        },
                        'on-check':(e)=>{
                            this.checkClass(e)
                        }
                    }
                }).then(modal=>{
                    modal.show()
                })
            },
            openMyModal(){
                this.$Modal.open('components/SelectClassModalMy.vue@modal',{
                    props:{
                        multiple:this.multiple,
                        selected:this.model,
                        width:this.modalWidth,
                        url:this.url,
                        notFoundText:this.notFoundText,
                        'disabled-temp':this.disabledTemp,
                        'is-demo-extra':this.isDemo
                    },
                    on:{
                        'on-select':(e)=>{
                            this.updateSelected(e)
                        },
                        'on-check':(e)=>{
                            this.checkClass(e)
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
                this.$emit('input',this.model);
                this.$emit('selected',selected)
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
            },
           
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