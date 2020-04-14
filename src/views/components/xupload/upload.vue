<template>
    <div :class="[prefixCls]">
        <div
            :class="classes"
            @click="handleClick"
            @drop.prevent="onDrop"
            @dragover.prevent="dragOver = true"
            @dragleave.prevent="dragOver = false">
            <input
                ref="input"
                type="file"
                :class="[prefixCls + '-input']"
                @change="handleChange"
                :multiple="multiple"
                :accept="accept">
            <slot></slot>
        </div>
        <slot name="tip"></slot>
        <upload-list
            v-if="showUploadList"
            :files="fileList"
            @on-file-remove="handleRemove"
            @on-file-preview="handlePreview">
        </upload-list>
    </div>
</template>
<script>
	import upload from './upload';
	import uploadCommon from './upload-common.mixin'
    import { oneOf } from '@/libs/util';
    import common from '@/libs/common.mixin';
    import UploadList from './upload-list.vue';

    const prefixCls = 'ivu-upload';

    export default {
        name: 'XUpload',
        mixins: [ common, uploadCommon, upload ],
        components: { UploadList },        
        data () {
            return {
                prefixCls: prefixCls,
                dragOver: false,
                fileList: [],
                tempIndex: 1,
                token: '',
                domain: ''
            };
        },
        computed: {
            classes () {
                return [
                    `${prefixCls}`,
                    {
                        [`${prefixCls}-select`]: this.type === 'select',
                        [`${prefixCls}-drag`]: this.type === 'drag',
                        [`${prefixCls}-dragOver`]: this.type === 'drag' && this.dragOver
                    }
                ];
            },
			urlPrefix () {
				let client_id = this.$store.state.user.info.client.cid,
					og_id = this.$store.state.user.info.og_id
				return `${this.prefix}${client_id}/${og_id}/`
			}
        },
        mounted () {
        	this.$emit('on-mounted')
        },
        created () {
        	
        },        
        methods: {
        	getUpToken () {   
        		return new Promise((resolve,reject)=>{
        			this.$http.get('upload')
	        		.then(response=>{
	        			this.token = response.body.uptoken
	        			this.domain = response.body.domain
	        			this.prefix = response.body.prefix
	        			resolve()
	        		},response=>{
	        			//console.log('------getUpTokenError')
	        			//console.log(response)
	        			reject(response)
	        		})
        		})
        		
        	},
            handleClick () {
                this.$refs.input.click();
            },
            handleChange (e) {
                const files = e.target.files;

                if (!files) {
                    return;
                }
                this.uploadFiles(files);
                this.$refs.input.value = null;
            },
            onDrop (e) {
                this.dragOver = false;
                this.uploadFiles(e.dataTransfer.files);
            },
            uploadFiles (files) {
                let postFiles = Array.prototype.slice.call(files);
                if (!this.multiple) postFiles = postFiles.slice(0, 1);

                if (postFiles.length === 0) return;

                postFiles.forEach(file => {
                    this.upload(file);
                });
            },
            upload (file) {
                if (!this.beforeUpload) {
                    return this.post(file);
                }

                const before = this.beforeUpload(file);
                if (before && before.then) {
                    before.then(processedFile => {
                        if (Object.prototype.toString.call(processedFile) === '[object File]') {
                            this.post(processedFile);
                        } else {
                            this.post(file);
                        }
                    }, () => {
                        // this.$emit('cancel', file);
                    });
                } else if (before !== false) {
                    this.post(file);
                } else {
                    // this.$emit('cancel', file);
                }
            },
            post (file) {
                // check format
                if (this.format.length) {
                    const _file_format = file.name.split('.').pop().toLocaleLowerCase();
                    const checked = this.format.some(item => item.toLocaleLowerCase() === _file_format);
                    if (!checked) {
                        this.onFormatError(file, this.fileList);
                        return false;
                    }
                }

                // check maxSize
                if (this.maxSize) {
                    if (file.size > this.maxSize * 1024) {
                        this.onExceededSize(file, this.fileList);
                        return false;
                    }
                }
				
				this.getUpToken()
				.then(()=>{
					this.handleStart(file);
	                let formData = new FormData();
	                formData.append(this.name, file);
	
	                this.ajax({
	                    headers: this.headers,
	                    withCredentials: this.withCredentials,
	                    file: file,
	                    data: this.data,
	                    token: this.token,
	                    filename: this.name,
	                    domain: this.domain,
	                    urlPrefix: this.urlPrefix,
	                    onProgress: e => {
	                        this.handleProgress(e, file);
	                    },
	                    onSuccess: res => {
	                        this.handleSuccess(res, file);
	                    },
	                    onError: (err, response) => {
	                        this.handleError(err, response, file);
	                    }
	                });
				},response=>{
					this.error(response.body.message||'上传失败~')
				})
                
            },
            handleStart (file) {
                file.uid = Date.now() + this.tempIndex++;
                const _file = {
                    status: 'uploading',
                    name: file.name,
                    size: file.size,
                    percentage: 0,
                    uid: file.uid,
                    showProgress: true
                };

                this.fileList.push(_file);
            },
            getFile (file) {
                const fileList = this.fileList;
                let target;
                fileList.every(item => {
                    target = file.uid === item.uid ? item : null;
                    return !target;
                });
                return target;
            },
            handleProgress (e, file) {
                const _file = this.getFile(file);
                this.onProgress(e, _file, this.fileList);
                
                if(e.total && e.total.loaded){
                	_file.loaded = e.total.loaded || 0;	
                }
                
                _file.percentage = e.percent || 0;
            },
            handleSuccess (res, file) {
                const _file = this.getFile(file);

                if (_file) {
                    _file.status = 'finished';
                    _file.response = res;
					
					this.saveMineFile(res,file)
                    this.dispatch('FormItem', 'on-form-change', _file);                    

                    setTimeout(() => {
                        _file.showProgress = false;
                    }, 1000);
                }                
            },
            saveMineFile (res,file) {
            	let _file = this.getFile(file),
                    splits = file.name.split('.'),
            		info = {
	            		js_upload: 1,
						file_url: `${this.domain}${res['x:name']}`,
						file_name: file.name,
						file_size: file.size,
						file_type: splits[splits.length-1]
					}
            	
            	this.$rest('upload').post(info)
            	.success(response=>{
            		
            		this.onSuccess(response, _file, this.fileList);
            	}).error(response=>{
            		
            	})
            },
            handleError (err, response, file) {
                const _file = this.getFile(file);
                const fileList = this.fileList;

                _file.status = 'fail';

                fileList.splice(fileList.indexOf(_file), 1);

                this.onError(err, response, file);
            },
            handleRemove(file) {
                const fileList = this.fileList;
                fileList.splice(fileList.indexOf(file), 1);
                this.onRemove(file, fileList);
            },
            handlePreview(file) {
                if (file.status === 'finished') {
                    this.onPreview(file);
                }
            },
            clearFiles() {
                this.fileList = [];
            }
        },
        watch: {
            defaultFileList: {
                immediate: true,
                handler(fileList) {
                    this.fileList = fileList.map(item => {
                        item.status = 'finished';
                        item.percentage = 100;
                        item.uid = Date.now() + this.tempIndex++;
                        return item;
                    });
                }
            }
        },
    };
</script>