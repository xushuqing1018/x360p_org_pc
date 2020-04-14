<template>
	<div :id="domId" class="prism-player">
    </div>
</template>

<script>
	import {_} from '@/libs/util'
	export default{
        props: {
			width: {
				type: String,
				default: '800px'
            },
            height:{
                type: String,
                default: '600px'
            },
            vid:{
                type: String,
                default: ''
            },
            playAuth:{
                type: String,
                default: ''
            },
            cover:{
                type: String,
                default: ''
            },
            autoPlay:{
                type: Boolean,
                default: true
            }
        },
		
		data () {
			return {
                domId: 'J_aliplayer',
                scriptTagStatus: 0,
                player : null
			}
        },
        created () {   
            if (typeof window['Aliplayer'] !== 'undefined') {
                // 如果全局对象存在，说明编辑器代码已经初始化完成，直接加载编辑器
                this.scriptTagStatus = 1;
                this.init();
            } else {
                // 如果全局对象不存在，说明编辑器代码还没有加载完成，需要加载编辑器代码
                this.insertScriptTag();
            }
        },
		methods: {
            getUID (prefix) {
                do {
                prefix += ~~(Math.random() * 1000000);
                }
                while (document.getElementById(prefix));
                return prefix;
            },
			insertScriptTag () {
                let aliplayer_script_dom = document.getElementById('aliplayer_script_tag');
                let aliplayer_css_dom = document.getElementById('aliplayer_css_tag');
                
                // 如果这个tag不存在，则生成相关代码tag以加载代码
                if (aliplayer_css_dom === null) {
                    aliplayer_css_dom = document.createElement('link')
                    aliplayer_css_dom.type = 'text/css'
                    aliplayer_css_dom.rel ='stylesheet'
                    aliplayer_css_dom.href = '//g.alicdn.com/de/prismplayer/2.6.0/skins/default/aliplayer-min.css'
                    aliplayer_css_dom.id  = 'aliplayer_css_tag'

                    aliplayer_script_dom = document.createElement('script')
                    aliplayer_script_dom.type = 'text/javascript'
                    aliplayer_script_dom.src =  '//g.alicdn.com/de/prismplayer/2.6.0/aliplayer-min.js'
                    aliplayer_script_dom.id = 'aliplayer_script_tag';


                    let s = document.getElementsByTagName('head')[0];
                    s.appendChild(aliplayer_css_dom);
                    s.appendChild(aliplayer_script_dom);
                }

                // 等待代码加载完成后初始化编辑器
                if (aliplayer_script_dom.loaded) {
                    this.scriptTagStatus++;
                } else {
                    aliplayer_script_dom.addEventListener('load', () => {
                        this.scriptTagStatus++;
                        aliplayer_script_dom.loaded = true;
                        this.init();
                    });
                }

                setTimeout(()=>{
                    this.init()
                },1000)


            },
            init () {
                if(typeof window['Aliplayer'] == 'undefined'){
                    setTimeout(()=>{
                        this.init()
                    },1000)
                    return
                }
                this.domId = this.getUID(this.domId);
                let config = {}
                config.id = this.domId 
                config.autoplay = this.autoPlay
                config.width = this.width 
                config.height = this.height
                config.vid = this.vid 
                config.playauth = this.playAuth
                this.initPlayer(config)
            },
            initPlayer (config) {
                setTimeout(()=>{
                    this.player = new Aliplayer(config)   
                },100)
                  
            }
		},
		watch:{
            vid(oldval,newVal){
                this.init()
            }
        }
	}
	
</script>

<style>
</style>