<template>
	<Modal v-drag-modal v-model="modal$.show" :title="modal$.title" width="700" :mask-closable="false">		
		<Form ref="form" :label-width="80" :model="info" :rules="rules">
			<Form-item label="仓库名称" prop="name">
				<Input v-model="info.name" placeholder="请输入仓库名称"></Input>
			</Form-item>
			<Form-item label="描述" prop="desc">
				<Input v-model="info.desc" placeholder="请输入仓库名称"></Input>
			</Form-item>
			<Form-item label="类型" prop="type">
				<RadioGroup v-model="info.type">
					<Radio :label="1">分仓库</Radio>
					<Radio :label="2">总仓库</Radio>
				</RadioGroup>
			</Form-item>
			<div v-if="info.type===1">
				<Alert>
					<Checkbox v-model="check_all" @on-change="checkAll">请选择可使用该仓库的校区：</Checkbox>					
				</Alert>
				<div class="row">
					<CheckboxGroup v-model="info.bids" class="col-sm-12">
						<Checkbox v-for="item in branchs" :label="item.bid">{{item.branch_name}}</Checkbox>
					</CheckboxGroup>
					<Alert v-if="!branchs.length" type="error" show-icon>
						所有校区都已经关联了仓库，只能新增不关联任何校区的独立仓库。
					</Alert>
				</div>
			</div>
		</Form>
		<div slot="footer">
			<Button type="ghost" @click="cancel">取消</Button>
			<Button type="primary" @click="ok">确定</Button>
		</div>
	</Modal>
		
</template>

<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import modal from '@/libs/modal.mixin'
	
	const emptyObject = {
		bids: [],
		type: 1,
		name: '',
		desc: ''
	}
	
	export default{
		mixins: [modal,common],
		data () {
			return {
				check_all: false,
				bids: [],
				info: util.copy(emptyObject),
				rules: {
					name: [
						{ required: true, message: '请输入仓库名称', trigger: 'blur' }
					]
				}
			}
		},
		watch: {
			'info.bids': function (val) {				
				this.check_all = val.length===this.branchs.length				
			},
			'modal$.show': function (val) {
				this.bids = util.copy(this.info.bids)
			}
		},
		methods: {
			checkAll (val) {
				this.info.bids = []
				if(val){
					this.branchs.forEach(b=>{
						this.info.bids.push(b.bid)
					})
				}
			},
			cancel () {
				this.info = util.copy(emptyObject)
				this.$form('form').reset()
				this.close()
			},
			ok () {
				this.$form('form').check()
				.then(()=>{
					let action = this.modal$.action,
							[method,uri,msg] = action=='add'?['post','material_stores','添加成功']:['put','material_stores/'+this.info.ms_id,'修改成功']
						
					if(this.info.type===2){
						this.info.bids = []
					}else{
						if(this.info.bids.length===0){
							this.$Message.error('分仓库必须绑定校区')
							return false
						}
					}
					
					this.$rest(uri)[method](this.info)
					.success(data=>{
						this.$Message.success(msg)
						this.$emit('on-success')
						this.cancel()
						this.$store.dispatch('updateGlobalVar','branchs')
					}).error(body=>{
						this.$Notice.error({
							title: '失败',
							desc: body.message||'添加失败'
						})
					})
				})
			}
		},
		computed: {
			branchs () {
				let branchs = this.$store.state.gvars.branchs,
					bids = this.bids,
					filter = (item) => {
						if(bids.length>0){
							return item.ms_id===0||bids.indexOf(item.bid)>-1
						}else{
							return item.ms_id===0
						}
					}					
				
				
				return branchs.filter(filter)
			}
		}
	}
</script>
