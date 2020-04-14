<template>
	<div :class="classes">
		<div style="display: flex;">
            <slot>
                <div
                	@click="openModal"
                	:style="style"
                	class="mr-2"
                    :class="[prefixCls + '-selection']"
                    ref="reference">
                    <span :class="[prefixCls + '-placeholder']" v-show="showPlaceholder">{{ localePlaceholder }}</span>
                    <span :class="[prefixCls + '-selected-value']" v-show="!showPlaceholder">{{ labelText }}</span>
                    <Icon type="ios-close" :class="[prefixCls + '-arrow']" v-if="showCloseIcon" @click.native.stop="clearSelected"></Icon>
                    <Icon type="arrow-down-b" :class="[prefixCls + '-arrow']"></Icon>
                </div>
                <Button type="ghost" icon="plus" @click="add" v-if="showAdd"></Button>
            </slot>
        </div>
		
		
		<Modal v-drag-modal :mask-closabled="false" v-model="modal$.show" :title="modal$.title" :width="450">
			<Form ref="form" :model="info" :label-width="100" :rules="rules_channel">
				<Form-item label="渠道名称" prop="channel_name">
					<Input v-model="info.channel_name" placeholder="请输入渠道名称"></Input>
				</Form-item>
				<Form-item label="对应招生来源" prop="from_did">
					<dictionary-from v-model="info.from_did" clearable></dictionary-from>
				</Form-item>
				<Form-item label="采单范围" prop="get_scope" v-if="showGetScope">
					<RadioGroup v-model="info.get_scope" type="button">
						<Radio :label="0">校区采单</Radio>
						<Radio :label="1">总部菜单</Radio>
					</RadioGroup>
				</Form-item>
				<Form-item label="是否共享渠道" prop="is_share">
					<i-switch v-model="info.is_share" :true-value="1" :false-value="0">
						<span slot="open">是</span>
						<span slot="close">否</span>
					</i-switch>
				</Form-item>
				<Form-item label="是否开启" prop="status">
					<i-switch v-model="info.status" :true-value="1" :false-value="0">
						<span slot="open">是</span>
						<span slot="close">否</span>
					</i-switch>
				</Form-item>
			</Form>
			<div slot="footer">
				<Button type="ghost" @click="close">关闭</Button>
				<Button type="primary" @click="save" :loading="saving">确定</Button>
			</div>
		</Modal>
	</div>
</template>

<script>
	import util from  '@/libs/util'
	import { oneOf, findComponentDownward } from '@/libs/assist'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import DictionaryFrom from 'c%/DictionaryFrom.vue'

	const prefixCls = 'ivu-select'
	const resName   = 'market_channel'
	const idField   = 'mc_id'
	const textField = 'channel_name'
	const recordName = '来源渠道'
	const unit       = '个'
	
	const emptyObject = {
		bid: 0,
		channel_name: '',
		is_share: 0,
		status: 1,
		from_did: 0,
		get_scope: 0
	}	
	
	export default{
		mixins: [ common, modal ],
		components: {
			DictionaryFrom
		},
		props: {
			value: {
                type: [Number, String, Array],
                default: 0
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
                type: String
            },
            placement: {
                validator (value) {
                    return oneOf(value, ['top', 'bottom']);
                },
                default: 'bottom'
            },
			showAdd: {
				type: Boolean,
				default: true
			},
			setDefault: {
				type: Boolean,
				default: false
			}
		},
		data () {
			this.rules_channel = {
				channel_name: [
					{ required: true, type:'string', message: '请输入渠道名称', trigger: 'blur' }
				],
				from_did: [
					{ required: true, type:'number', min:1, message: '请选择招生来源', trigger: 'change' }
				]
			}
			return {
				prefixCls: prefixCls,
				options: [],
				optionsInstances: [],
				labelText: '',
				model: this.value||0,
				info: util.copy(emptyObject)
			}
		},
		watch: {
			value: function (val) {
				this.model = val
				this.updateLabelText()
			},
			model: function (val) {				
				this.$emit('input',val)
				this.dispatch('FormItem','on-form-change',val)
			},
			'modal$.show': function (val) {
				if(val&&this.modal$.action=='add'){
					this.info = util.copy(emptyObject)
				}
			}
		},
		created(){
            this.model = this.value
            this.updateLabelText()
        },
		methods: {	
			openModal() {
				if(this.disabled) {
					return false
				}			
				this.$Modal.open('components/SelectChannelModal.vue@modal',{
					props: {
						multiple: this.multiple,
						selected: this.model,
						disabledIds: this.disabledIds,
						width: this.modalWidth
					},
					on:{
						'on-select': (e) => {
							this.updateSelected(e)
						}
					}
				}).then(modal => {
					modal.show('选择来源渠道')
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
                this.$emit('select',this.model)
                this.$emit('on-change',this.model)
                this.$emit('on-selected',selected)
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
			add () {
				this.show('新增来源渠道','add')
			},
			save () {
				this.$form('form').check().then(() => {
					this.ok()
				})
			},
			ok () {
				let params = util.copy(this.info)
				params.bid = this.bid$
				
				let [uri,method,msg] = this.modal$.action=='add'?['market_channels','post','添加成功！']:['market_channels/'+params.mc_id,'put','修改成功！']
				
				this.$rest(uri)[method](params)
				.success(data=>{
					this.$Message.success(msg)
					this.$emit('on-success');
					this.close()
				}).error(response=>{
					this.error(response.body.message||'添加失败~')
				})
			}
		},
		computed: {
			style () {
				return {
					display: 'inline-block',
					width: this.showAdd?'calc(100% - 54px)':'100%'
				}
			},
			modalWidth() {
				if(this.multiple) {
					return '900'
				}
				return '640'
			},
			multiple() {
				if(Array.isArray(this.model)) {
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
			showPlaceholder() {
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
            localePlaceholder() {
            	if(this.placeholder === undefined) {
            		return '请选择'
            	} else {
            		return this.placeholder
            	}
            },
            showCloseIcon() {
            	return this.clearable && !this.showPlaceholder
            }
		}
	}
</script>

<style>
</style>