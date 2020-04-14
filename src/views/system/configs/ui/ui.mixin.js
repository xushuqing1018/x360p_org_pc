

export default{
	data () {
		return {
			upload_process: false,
			upload_percent: 0
		}
	},
	computed: {
		upload_header(){
            return {
                'x-token':this.$store.state.user.token,
                'x-file-key':'file'
            }
        },
        pcUrl () {
        	let product_url = this.$store.state.user.info.product_url,
        		x_sub_host = this.$store.state.user.info.x_sub_host,        		
        		result = product_url.split('//')[0]+'//'+x_sub_host+'.'+product_url.split('//')[1] 
        	return result
        },
        mobileUrl () {
        	let product_url = this.$store.state.user.info.product_url,
        		x_sub_host = this.$store.state.user.info.x_sub_host,        		
        		result = product_url.split('//')[0]+'//'+x_sub_host+'.'+product_url.split('//')[1]+'/student/login' 
        	return result
        }
	},	
	methods: {
		save () {
			this.$emit('on-save')
		},
        handleUploadError(err,file){            	
        	this.$Notice.warning({
                title: '文件上传失败',
                desc: '文件 ' + file.name + ' 上传失败'
            });
        },
        handleUploadBefore(file){
        	this.upload_process = true
        	this.upload_percent = 0
        },
        handleUploadProgress(event,file,filelist){
        	this.upload_percent = event.percent
        },
        handleFormatError (file) {
        	this.upload_process = false
            this.$Notice.warning({
                title: '文件格式不正确',
                desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
            });
        },
        handleMaxSize (file) {
            this.$Notice.warning({
                title: '超出文件大小限制',
                desc: '文件 ' + file.name + ' 太大，超出了限定大小'
            });
        },
	}
}

