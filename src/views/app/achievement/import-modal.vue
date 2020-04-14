<template>
	<Modal v-drag-modal :mask-closable="false" :width="600" v-model="modal$.show" :title="modal$.title">
		<a :href="tpl" download class="ivu-btn ivu-btn-primary" style="color:#fff;">
			<Icon type="ios-cloud-download-outline"></Icon> 下载模板
		</a>
		<div class="mt-2">
			<label>班级名称：</label>
			<select-class v-model="cid" clearable style="width:300px;" placeholder="选了班级则学员必须在班级内，不选则班级未知"></select-class>
		</div>
		<div class="mt-2">
			<Row>
				<Col span="10">
					<label style="vertical-align:top">文件上传：</label>
					<Upload
						ref="upload"
						type="drag"
						:format="['xls','xlsx']"
						:max-size="5120"
						:headers="headers"
						:on-success="handleSuccess"
						:on-error="handleError"
						:on-format-error="handleFormatError"
                        :on-exceeded-size="handleMaxSize"
						action="/api/import"
						style="display:inline-block">
						<Button type="ghost" icon="ios-cloud-upload-outline" :disabled="import_disabled">请选择或拖拽文件</Button>
					</Upload>
				</Col>
				<Col span="14">
					<template v-if="imported">
						<a class="text-success"><Icon type="checkmark-circled"></Icon>导入完成</a>&nbsp;
						<span>总处理数据:{{records.deal}}</span>&nbsp;
                        <span v-if="records.success">成功导入:{{records.success}}</span>&nbsp;
                        <span v-if="records.failure">失败:{{records.failure}}</span>&nbsp;
                        <span v-if="records.repeat">排除重复:{{records.repeat}}</span><br/>
                    </template>
					<template v-if="abored">
						<span class="text-danger text-2x"><Icon type="close-circled"></Icon>导入失败!</span>
		                <span class="well">{{records.error_msg}}</span><br/>
					</template>
					<Button 
						class="mt-2"
						type="primary" 
						size="small" 
						@click="importAgain" 
						v-if="imported||abored">
						{{imported?'再次导入':'重新导入'}}
					</Button>
				</Col>
			</Row>
		</div>
		<div class="mt-2" v-if="records.importData.length>0">
			<label>导入信息：</label><br/>
			<div class="entry-table-body" style="max-height:300px">
				<table class="modal-table">
					<thead>
						<tr>
							<th v-for="item in records.importHead"><div class="ivu-table-cell">{{item.name}}</div></th>
							<th><div class="ivu-table-cell">导入状态</div></th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="data in records.importData">
							<td v-for="item in data.import_data"><div class="ivu-table-cell">{{item}}</div></td>
							<td><div class="ivu-table-cell">

								<span v-if="data.is_success"><Icon class="text-success" type="checkmark-circled"></Icon> 导入成功</span>
								<span v-else><Icon class="text-danger" type="close-circled"></Icon> {{data.msg}}</span>
							</div></td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		<div slot="footer">
			<Button type="ghost" @click="close">关闭</Button>
		</div>
	</Modal>
</template>

<script>
	import util,{_} from '@/libs/util'
	import modal from '@/libs/modal.mixin'
	import common from '@/libs/common.mixin'
	import globals from '@/libs/globals.mixin'
	import SelectClass from 'c%/SelectClass.vue'

	const records = {
		fk:'',
        size:10,
        data_count:0,
        rows:0,
        cols:0,
        deal:0,
        page:0,
        success:0,
        failure:0,
        repeat:0,
        error_logs:[],
        error_msg:'',
        importData:[],
        importHead:[]
	}

	export default {
		mixins: [modal,common,globals],
		components: {
			SelectClass
		},
		data() {
			return {
				data: {},
				cid: 0,
				imported:false,
                abored:false,
                records:util.copy(records),
                import_disabled: false,
			}
		},
		methods: {
			handleSuccess(res,file,fileList){
				this.import_disabled = true
                this.records.data_count = res.data.data_count
                this.records.rows       = res.data.rows
                this.records.cols       = res.data.cols
                this.records.fk         = res.data.fk
                this.records.size       = res.data.size
                this.startDealData()
            },
            handleError(res,file,fileList){
            	this.$Notice.warning({
            		title:'上传文件失败',
            		desc:'文件'+file.name+'上传失败:'
            	})
            },
            handleFormatError (file) {
                this.$Notice.warning({
                    title: '文件格式不正确',
                    desc: '文件 ' + file.name + ' 格式不正确，请上传 Excel文件。'
                });
            },
            handleMaxSize (file) {
                this.$Notice.warning({
                    title: '超出文件大小限制',
                    desc: '文件 ' + file.name + ' 太大，不能超过 5M。'
                });
            },
            startDealData() {
            	this.records.page = 1
                this.loopDealData()
            },
            loopDealData() {
            	let param = {
            		func:'student_exam_scores',
            		fk:this.records.fk,
            		page:this.records.page,
            		pagesize:20,
            		se_id:this.data.se_id
            	}
            	if(this.cid > 0) {
            		param.cid = this.cid
            	}
            	this.$rest('import')
            	.get(param)
                .success(response=>{
                    var d = response;
                    this.records.success += d.success;
                    this.records.repeat += d.repeat;
                    this.records.failure += d.failure;
                    this.records.deal  = d.deal;
                    this.records.importHead = d.field_title
                    this.records.error_logs = this.records.error_logs.concat(d.log);
                    this.records.importData = this.records.importData.concat(d.list);
                    if(d.next == 0){
                        this.endImport(true);
                    }else{
                        this.records.page = d.next;
                        this.loopDealData();
                    }
                })
                .error(response=>{
                    this.importing = false;
                    this.abored = true;
                    this.records.error_msg = response.body.message;
                    this.endImport(false)
                })
            },
            endImport(result){
                if(result){
                    this.imported = true
                    this.abored = false
                }else{
                    this.imported = false
                    this.abored = true
                }
                this.$emit('on-import-finish',this.records)
                this.$http.delete('import')
            },
            importAgain() {
            	this.import_disabled = false
            	this.imported = false
            	this.abored = false
            	this.records = util.copy(records)
            	this.$r('upload').clearFiles()
            }
		},
		computed: {
			tpl() {
				return 'api/student_exam_scores/download_excel_template?se_id='
					+this.data.se_id+'&token='+this.$store.state.user.token
			},
			headers() {
				return {
        			'x-token':this.$store.state.user.token,
        			'x-import-func':'student_exam_scores'
        		}
			},
			table_head() {
				let dids,
					subjects = this.dicts('exam_subject'),
					result = []
				if(!_.isEmpty(this.data)) {
					dids = this.data.exam_subject_dids
					dids.forEach(did=>{
						result.push({
							title:subjects.find(item=>item.did==did).title,
							did:did
						})
					})
				}
				return result
			}
		},
		watch: {
			'modal$.show':function(val) {
				if(val) {
					this.importAgain()
				}
			}
		}
	}
</script>