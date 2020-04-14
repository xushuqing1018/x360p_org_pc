<style lang="less">
.logs-container{
    max-height:200px;
    overflow-y:auto;
}
</style>
<template>
	<Button type="primary" @click="bat_add" icon="upload"><slot>批量导入</slot>
		<Modal v-drag-modal :mask-closable="false" v-model="modal" :title="modalTitle">
            <Steps :current="step">
                <Step title="下载模板" icon="ios-cloud-download"></Step>
                <Step title="上传文件" icon="upload"></Step>
                <Step title="数据导入" icon="loop"></Step>
                <Step title="导入完成" icon="checkmark-circled"></Step>
            </Steps>
            <div class="import-wrap">
                <div class="down-desc" v-if="step == 0">
					<p><strong>下载说明</strong></p>
					<ul>
						<li>1,点击下面的“下载”按钮就可以下载模板</li>
						<li>2,下载的模板文件打开之后有2个sheet表，请阅读第2个sheet表“填写说明”</li>
						<li>3,切换回sheet表"数据表",按格式填写好需要导入的数据</li>
						<li>4,如遇无法识别的Excel格式，请下载 <a target="_blank" href="http://www.wps.cn">WPS表格</a> 软件进行编辑后再上传</li>
						<li>5,如已经下载过模板文件并且已经填写好表格，请直接点击下一步</li>
					</ul>
                    <a :href="tpl" @click="import_next" download class="ivu-btn ivu-btn-primary"><Icon type="ios-cloud-download-outline"></Icon>下载</a>
                </div>
                <div v-if="step == 1">
                    <Upload
                        type="drag"
                        :format="['xls','xlsx']"
                        :max-size="5120"
                        :headers="headers"
                        :on-success="handleSuccess"
                        :on-error="handleError"
                        :on-format-error="handleFormatError"
                        :on-exceeded-size="handleMaxSize"
                        action="/api/import">
                        <div style="padding: 20px 0">
                            <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                            <p>点击或将填写好的文件拖拽到这里上传</p>
                        </div>
                    </Upload>
                </div>
                <div v-if="step == 2">
                    <p>正在导入数据，请不要关闭窗口!</p>
                    <Progress :percent="percent" status="active"></Progress>
                    <div class="logs-container" v-if="records.error_logs.length > 0">
                        <p v-for="log in records.logs">
                        {{log}}
                        </p>
                    </div>

                </div>
                <div v-if="step == 3">
                   
                    <div v-if="imported">
                        <p class="text-success"><Icon type="checkmark-circled"></Icon>导入完成!</p>
                        <ul class="list-unstyled">
                            <li><label>总处理数据:</label><Badge :count="records.deal" overflow-count="9999" class-name="bg-info"></Badge></li>
                            <li v-if="records.success"><label>成功导入:</label><Badge :count="records.success" overflow-count="9999" class-name="bg-success"></Badge></li>
                            <li v-if="records.failure"><label>失败:</label><Badge :count="records.failure" overflow-count="9999" class-name="bg-danger"></Badge></li>
                            <li v-if="records.repeat"><label>排除重复:</label><Badge :count="records.repeat" overflow-count="9999" class-name="bg-warning"></Badge></li>
                        </ul>
                        <div class="well" v-if="records.failure > 0 || records.repeat > 0">
                            <p><strong>导入失败日志如下:</strong></p>
                            <div class="logs-container">
                                <p v-for="log in records.error_logs">{{log.error_message}}</p>
                            </div>
                        </div>
                        <p class="mt-1">
                            <button class="ivu-btn ivu-btn-primary" @click="go_step(0)">返回再次导入</button>
                            <button class="ivu-btn ivu-btn-primary" @click="downloadC" v-if="records.failure > 0 || records.repeat > 0">
                                下载错误批注
                            </button>
                            <button class="ivu-btn ivu-btn-error m-l-xs" @click="close">关闭</button>
                        </p>
                    </div>
                    <div v-if="abored">
                        <p class="text-danger text-2x"><Icon type="close-circled"></Icon> 导入失败!</p>
                        <div class="well">{{error_msg}}</div>
                        <p>
                            <button class="ivu-btn ivu-btn-primary" @click="go_step(0)">返回再次导入</button>
                            <button class="ivu-btn ivu-btn-error m-l-xs" @click="close">关闭</button>
                        </p>
                    </div>
                </div>
            </div>
            <div slot="footer">
                <div v-if="step != 3">
                    <Button :disabled="prev_disabled" @click="import_prev" v-if="step > 0">上一步</Button>
                    <Button type="primary" :disabled="next_disabled" @click="import_next">下一步</Button>
                </div>
            </div>
        </Modal>
	</Button>
</template>
<script>
    import util from '@/libs/util'
	export default {
		name:'ImportButton',
		props:{
			res:{
				type:String
			},
			name:{
				type:String,
				default:''
			},
			params: {
				type: String,
				default: ''
			}
		},
        data () {
        	return {
	        	modal:false,
	            step:0,
	            prev_disabled:false,
	            next_disabled:false,
                imported:false,
                abored:false,
                error_msg:'',
                records:{
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
                    error_file_path: ''
                }
	        }
        },
        methods:{
            close(){
                this.reset_data()
                this.modal = false
            },
            reset_data(){
                this.step = 0
                this.next_disabled = false
                this.prev_disabled = false                
                this.imported = false
                this.abored = false
                this.records.fk = ''
                this.records.data_count = 0
                this.records.deal= 0
                this.records.page = 0
                this.records.repeat = 0
                this.records.error_logs = []
                this.records.failure = 0
                this.records.success = 0
                this.error_msg = ''
            },
            bat_add(){
                this.modal = true
            },
            go_step(step){
                this.step = step
                if(step == 0){
                    this.reset_data()
                }
            },
            import_prev(){
                this.step = this.step - 1;
                if(this.step == 0){
                    this.next_disabled = false
                }
                if(this.step == 1){
                    this.next_disabled = true
                }
            },
            import_next(){
                if(this.step == 0){
                    this.step = this.step+1;
                } 
                if(this.step == 1){
                    this.next_disabled = true
                }
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
            handleSuccess(res,file,fileList){
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
            startDealData(){
                this.step = this.step + 1
                this.next_disabled = true
                this.prev_disabled = true
                this.records.page = 1
                this.loopDealData()
            },
            loopDealData(){
            	let params = this.params?'&'+this.params:''
                this.$http.get('import?func='+this.res+params+'&fk='+this.records.fk+'&page='+this.records.page+'&pagesize=20')
                .then(response=>{
                    var d = response.body.data;
                    this.records.error_file_path = d.error_file_path;
                    this.records.success += d.success;
                    this.records.repeat += d.repeat;
                    this.records.failure += d.failure;
                    this.records.deal  = d.deal;
                    this.records.error_logs = this.records.error_logs.concat(d.log);
                    if(d.next == 0){
                        this.endImport(true);
                    }else{
                        this.records.page = d.next;
                        this.loopDealData();
                    }
                },response=>{
                    this.importing = false;
                    this.abored = true;
                    this.error_msg = response.body.message;
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
                this.step = this.step+1
                this.next_disabled = true
                this.prev_disabled = false
                this.$emit('on-import-finish',this.records)
                this.$http.delete('import')

            },
            downloadC() {
                let src = util.sprintf('%s/%s',this.$store.state.user.info.product_url,this.records.error_file_path)
                let a = document.createElement('a')
                a.setAttribute('href',src)
                a.setAttribute('download','download')
                a.click()
            }
        },
        computed:{
        	tpl(){
        		let params = this.params?'&'+this.params:''
        		return '/api/import?tpl='+this.res+'&token='+this.$store.state.user.token+params
        	},
        	modalTitle(){
        		return '批量导入'+this.name
        	},
        	headers(){        		
        		return {
        			'x-token':this.$store.state.user.token,
        			'x-import-func':this.res
        		}
        	},
            percent(){
                return Math.round(this.records.deal / this.records.data_count)
            }
        }
    }
</script>