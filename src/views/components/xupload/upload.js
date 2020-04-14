import * as qiniu from 'qiniu-js'

function make_save_file_name (urlPrefix,file) {
	let arr =  ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
		str = '',
		range = 32,
		index = file.name.lastIndexOf('.'),
		filetype = file.name.substring(index)
		
	for(let i = 0; i < range; i++){
        let pos = Math.round(Math.random() * (arr.length-1));
        str += arr[pos];
    }
	
	return `${urlPrefix}${str}${filetype}` 
}

export default{
	data () {
		return {
			option: {},
			uploadFileList:{}
		}
	},
	methods: {
		qiniuHandleStart (file) {
			let filekey = `file_${file.uid}`
			
			// 调用sdk上传接口获得相应的observable，控制上传和暂停			
			this.uploadFileList[filekey].subscription = this.uploadFileList[filekey].observable.subscribe(this.uploadFileList[filekey].subObject); 
		},
		qiniuHandlePause (file) {
			let filekey = `file_${file.uid}`
			
			this.uploadFileList[filekey].subscription.unsubscribe();			
		},
		setOption (option) {
			this.option = option
		},
		getUploadParams (file) {
			let option = this.option,
				key = make_save_file_name(option.urlPrefix,file),
				token = option.token,
				domain = option.domain,
				finishedAttr = [],
				compareChunks = [],
				config = {
			      useCdnDomain: true,
			      disableStatisticsReport: false,
			      retryCount: 6,
			      region: qiniu.region.z2
			    },
				putExtra = {
					fname: "",
				    params: {
				    	'x:name': key
				    },
				    mimeType: null
				},
				next = (e) => {
					let chunks = e.chunks||[];
			        let total = e.total;
			        // 这里对每个chunk更新进度，并记录已经更新好的避免重复更新，同时对未开始更新的跳过
			        for (let i = 0; i < chunks.length; i++) {
			          	if (chunks[i].percent === 0 || finishedAttr[i]){
			            	continue;
			          	}
			          	if (compareChunks[i].percent === chunks[i].percent){
			            	continue;
			          	}
			          	if (chunks[i].percent === 100){
			            	finishedAttr[i] = true;
			          	}          
			        }
			        e.percent = total.percent;
			        
			        option.onProgress(e);
			        compareChunks = chunks
				},
				error = (e) => {
					option.onError(e.message,e)
				},
				complete = (e) => {
					option.onSuccess(e)
				}
				
				var subObject = { 
			        next: next,
			        error: error,
			        complete: complete
			    };
			    
			return {
				key: key, 
				token: token, 
				putExtra: putExtra, 
				config: config,
				subObject: subObject
			}
		},
		ajax (option) {
			this.setOption(option)
			
			let params = this.getUploadParams(option.file),
				filekey = `file_${option.file.uid}`,
				observable = qiniu.upload(option.file, params.key, params.token, params.putExtra, params.config);
			
			this.$set(this.uploadFileList,filekey,{
				subObject: params.subObject,
				observable: observable,
				subscription: null
			})
						
			this.qiniuHandleStart(option.file)
		}
	}
}
