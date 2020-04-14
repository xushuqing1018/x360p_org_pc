<template>
  <div :id="domId" @drop="droptext"></div>
</template>

<script>
const QRCODE_IMG = '<img qrcode="true" src="/static/img/mpqr.jpg" height="110px" width="110px"/>'
function replace_qrcode(html){
  return html.replace('{{bs.qrcode}}',QRCODE_IMG)
}
  export default {
    name:'Umeditor',
    props: {
      value: {
        type: String,
        default: ''
      },
      umeditorPath: {
        // UEditor 代码的路径
        type: String,
        default: '/static/umeditor/'
      },
      config: {
        type: Object,
        default: () => {
          return {};
        }
      },
      toolbar: {
        type: Array,
        default: () => {
          return [];
        }
      }
    },
    data () {
      return {
        um: null,
        domId: 'J_UMeditor',
        defaultToolbar: [ // 默认工具栏，详见umeditor.config.js
          'source',
          '|',
          ' undo redo',
          '|',
          ' bold italic underline strikethrough horizontal',
          '|',
          ' forecolor backcolor',
          '|',
          'insertorderedlist insertunorderedlist',
          '|',
          'paragraph fontfamily fontsize' ,
          '|',
          'justifyleft justifycenter justifyright justifyjustify',
          '|',
          'link unlink',
          '|',
          ' removeformat',
          '|',
          'image'
        ],
        defaultConfig: { // UMeditor 配置项，详见 umeditor.config.js
          imageUrl: '', // 上传地址
          zIndex: 1050, // 默认为 900，但是 modal-backdrop 的 z-index = 1040，故不可比它小
          initialFrameWidth: '100%', // 初始化宽度
          initialFrameHeight: 200, // 初始化高度 px
          autoClearinitialContent: true, // 是否自动清除编辑器初始内容
          zIndex: 2999,
        },
        scriptTagStatus: 0
      }
    },
    created () {   
      if (window.UM !== undefined) {
        // 如果全局对象存在，说明编辑器代码已经初始化完成，直接加载编辑器
        this.scriptTagStatus = 2;
        this.init();
      } else {
        // 如果全局对象不存在，说明编辑器代码还没有加载完成，需要加载编辑器代码
        this.insertScriptTag();
      }
    },
    methods: {
       insertScriptTag () {
        let editorScriptTag = document.getElementById('umeditorScriptTag');
        let configScriptTag = document.getElementById('umconfigScriptTag');
        let editorCssTag = document.getElementById('editorCssTag');
        // 如果这个tag不存在，则生成相关代码tag以加载代码
        if (editorScriptTag === null) {
          editorCssTag = document.createElement('link')
          editorCssTag.type = 'text/css'
          editorCssTag.rel ='stylesheet'
          editorCssTag.href = this.umeditorPath+'themes/default/css/umeditor.min.css'
          editorCssTag.id = 'editorCssTag'

          configScriptTag = document.createElement('script');
          configScriptTag.type = 'text/javascript'; configScriptTag.src = this.umeditorPath + 'umeditor.config.js'; configScriptTag.id = 'umconfigScriptTag';

          editorScriptTag = document.createElement('script');
          editorScriptTag.type = 'text/javascript'; editorScriptTag.src = this.umeditorPath + 'umeditor.min.js'; editorScriptTag.id = 'umeditorScriptTag';
          let s = document.getElementsByTagName('head')[0];
          s.appendChild(editorCssTag);
          s.appendChild(configScriptTag);
          s.appendChild(editorScriptTag);
        }

        // 等待代码加载完成后初始化编辑器
        if (configScriptTag.loaded) {
          this.scriptTagStatus++;
        } else {
          configScriptTag.addEventListener('load', () => {
            this.scriptTagStatus++;
            configScriptTag.loaded = true;
          });
        }

        if (editorScriptTag.loaded) {
          this.scriptTagStatus++;
        } else {
          editorScriptTag.addEventListener('load', () => {
            this.scriptTagStatus++;
            editorScriptTag.loaded = true;
            this.init();
          });
        }
      },
      init () {
        this.domId = this.getUID(this.domId);
        let config = {};
        this.defaultConfig.imageUrl = this.serverUrl
        // 获取配置项
        Object.assign(config, this.defaultConfig, this.config);
        config.toolbar = this.toolbar.length > 0 ? this.toolbar : this.defaultToolbar;

        // 异步初始化，避免 DOM 的 Id 还未渲染，而导致初始化找不到 DOM 报错
        this.$nextTick(() => {
          this.initEditor(this.domId, config);
        });
      },
      initEditor (domId, config) {
        this.um = window.UM.getEditor(domId, config);
        this.bind();
      },
      bind () {
        // 当编辑器初始化完成，设置 content
        this.um.ready(() => {
          this.um.setContent(this.value);
        });

        // 当编辑内容发生改变，emit 一个 change 事件，并传进当前的内容
        this.um.addListener('contentChange', () => {
          let content = this.getContent()
          if(content.indexOf('{{bs.qrcode}}') !== -1){
            content = replace_qrcode(content)
            this.um.setContent(content)
          }
          this.$emit('input',content)
        })
      },
      getUID (prefix) {
        do {
          prefix += ~~(Math.random() * 1000000);
        }
        while (document.getElementById(prefix));

        return prefix;
      },
      reset () {
        this.um.reset();
        this.um.setContent('');
      },
      destroy () {
        this.um.destroy();
      },
      setContent (content) {
        this.um.setContent(content);
      },
      getContent () {
        return this.um.getContent();
      },
      droptext(e){
        let text = e.dataTransfer.getData('text')
        if(text == '{{bs.qrcode}}'){
          $(e.target).append(QRCODE_IMG)
          e.preventDefault()
        }
      }
    },
    watch: {
      value (val) {
        if(val != this.getContent()){
          this.um.setContent(val);
        }
      }
    },
    computed:{
      serverUrl(){
        return '/api/umeditor?token='+this.$store.state.user.token
      }
    }
  }
</script>