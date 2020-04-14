<template>
  <div>     	
  	<slot></slot>
		<div class="weui-uploader__input-box" id="container" v-show="uploading===0" style="float: none;">			
		  <span class="weui-uploader__input" id="pickfiles"></span>
		</div>
  </div>
</template>

<script>
// import Qiniu sdk object
import Qiniu from '../../libs/qiniu'
export default {
  name: 'QUpload',
  components:{},
  props: {
    title: String, // 标题
    BeforeUpload: Function, // 每个文件上传前,处理相关的事情
    uploadSelect: Function, // 选中上传文件后触发的回调函数
    getFiles: Function, // 获取上传的文件列表回调函数
    uploadProgress: Function,
    overMax: Function, // 超出选取文件数的提醒函数
    domain: String, // qiniu space bind url
    uptokenUrl: String, // get qiniu upload token (http request url)
    max: {
    	type: Number,
    	default: 1
    }, 				//最大上传文件数
    header:Object,      //获取uptoken的头部参数，用于放x-token验证信息
    files:Array         //初始化文件列表
  },
  data () {
    return {
      uploading: 0, // uploading show text
      inputId: '',
    }
  },
  created () {
    // 等待DOM渲染完成后执行
    this.$nextTick(() => {
      this.uploadInit()
    })
  },
  methods: {
    uploadFiles (id) {
      this.$el.querySelector('#' + id).click()
    },
    uploadInit () {
      this.upload()
      setTimeout(() => {
        // 获取js-sdk 生成的DOM元素的 id
        this.inputId = this.$el.querySelector('#container input').getAttribute('id')
      }, 500)
    },
    upload () {
      let me = this
      let setting = {
        runtimes: 'html5,flash,html4',    // 上传模式,依次退化
        browse_button: 'pickfiles',       // 上传选择的点选按钮，**必需**
        header:this.header,               // 头部
        uptoken_url: this.uptokenUrl,        // Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
        // uptoken: '',
        // 若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
        // uptoken_func: function(file){    // 在需要获取uptoken时，该方法会被调用
        //     return jsonToken;
        // },
        unique_names: true, // 默认 false，key为文件名。若开启该选项，SDK为自动生成上传成功后的key（文件名）。
        // save_key: true,   // 默认 false。若在服务端生成uptoken的上传策略中指定了 `sava_key`，则开启，SDK会忽略对key的处理
        domain: this.domain,   // bucket 域名，下载资源时用到，**必需**
        get_new_uptoken: false,  // 设置上传文件的时候是否每次都重新获取新的token
        container: 'container',           // 上传区域DOM ID，默认是browser_button的父元素，
        max_file_size: '500mb',           // 最大文件体积限制
        flash_swf_url: 'js/plupload/Moxie.swf',  // 引入flash,相对路径
        max_retries: 3,                   // 上传失败最大重试次数
        dragdrop: false,                   // 开启可拖曳上传
        drop_element: 'container',        // 拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
        chunk_size: '4mb',                // 分块上传时，每片的体积
        auto_start: true,                 // 选择文件后自动上传，若关闭需要自己绑定事件触发上传
        init: {
          FilesAdded (up, files) {
            if(files.length > 1){ 	//files.length > 1 || files.length + me.files.length > 
              me.overMax()
              return false
            }
          },
          BeforeUpload (up, file) {
            // 每个文件上传前,处理相关的事情
            me.BeforeUpload(up,file)
          },
          UploadProgress (up, file) {
            // 每个文件上传时,处理相关的事情
            me.uploadProgress(up,file)
          },
          FileUploaded (up, file, info) {
            // 每个文件上传成功后,处理相关的事情
            // 其中 info 是文件上传成功后，服务端返回的json，形式如
            // {
            //    "hash": "Fh8xVqod2MQ1mocfI4S4KpRL6D98",
            //    "key": "gogopher.jpg"
            //  }
            // 参考http://developer.qiniu.com/docs/v6/api/overview/up/response/simple-response.html
           
            let domain = up.getOption('domain')
            let res = JSON.parse(info.response)
           

            let sourceLink = domain + '/' + res.key // 获取上传成功后的文件的Url
            me.files.push({type:file.type,size:file.size,src:sourceLink})
            me.getFiles(me.files)
            me.uploadInit()
          },
          Error (up, err, errTip) {
            // 上传出错时,处理相关的事情
            
          },
          UploadComplete () {
            // 队列文件处理完毕后,处理相关的事情
            // 上传完成后改回上传按钮Icon
            // 向父组件返回上传信息
            me.getFiles(me.files)
            // reset components
            me.uploadInit()
          },
          Key (up, file) {
            // 若想在前端对每个文件的key进行个性化处理，可以配置该函数
            // 该配置必须要在 unique_names: false , save_key: false 时才生效
            // let key = " "
            // do something with key here
            // return key
           
          }
        }
      }
      Qiniu.uploader(setting)
    }
  }
}
</script>

<style>
.moxie-shim{
	width: 77px !important;
	height: 77px !important;
}
.moxie-shim input{
	z-index: 3 !important;
}
.weui-cell {
  padding: 10px 15px;
  position: relative;
  display: flex;
  align-items: center;
}
.weui-cell__bd {
  flex: 1;
}
.weui-uploader__hd {
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  padding-bottom: 10px;
  -webkit-box-align: center;
  -webkit-align-items: center;
          align-items: center;
}
.weui-uploader__title {
  -webkit-box-flex: 1;
  -webkit-flex: 1;
          flex: 1;
}
.weui-uploader__info {
  color: #B2B2B2;
}
.weui-uploader__bd {
  margin-bottom: -4px;
  margin-right: -9px;
  overflow: hidden;
}
.weui-uploader__file {
  float: left;
  margin-right: 9px;
  margin-bottom: 9px;
}
.weui-uploader__img {
  display: block;
  width: 79px;
  height: 79px;
}
.weui-uploader__file_status {
  position: relative;
}
.weui-uploader__file_status:before {
  content: " ";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
}
.weui-uploader__file-content {
  position: absolute;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
          transform: translate(-50%, -50%);
  color: #FFFFFF;
}
.weui-uploader__input-box {
  float: left;
  position: relative;
  margin-right: 9px;
  margin-bottom: 9px;
  width: 77px;
  height: 77px;
  border: 1px solid #D9D9D9;
}
.weui-uploader__input-box:before,
.weui-uploader__input-box:after {
  content: " ";
  position: absolute;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
          transform: translate(-50%, -50%);
  background-color: #D9D9D9;
}
.weui-uploader__input-box:before {
  width: 2px;
  height: 39.5px;
}
.weui-uploader__input-box:after {
  width: 39.5px;
  height: 2px;
}
.weui-uploader__input-box:active {
  border-color: #999999;
}
.weui-uploader__input-box:active:before,
.weui-uploader__input-box:active:after {
  background-color: #999999;
}
.weui-uploader__input {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}
.video-responsive{
  width:100%;
}
</style>