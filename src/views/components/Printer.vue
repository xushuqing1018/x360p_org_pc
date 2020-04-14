<style lang="less">
.printer{
   position:absolute;
   left:0;
   top:0;
   width:0;
   height:0;
   zIndex:9999;
}
.printer-debug{
	width:750px;
	height:750px;
	background:'wheat';
}
</style>
<template>
	<iframe 
	src="about:blank"
	:class="classes" 
	>
	</iframe>
</template>
<script>
import Vue from 'vue'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import {_} from '@/libs/util'
import util from '@/libs/util'

const style_fe = "<style type='text/css'>\n"
		+"body{margin:0;padding: 0;background:white !important;color:#000 !important;}\n"
		+"@media print {.non-printing {display: none;}}\n"
		+"</style>"
//portrait 竖向 landscape 横向
const style_landspace="<style type='text/css'>\n"
		+"@page{size:A4 portrait;margin:1cm;}\n"
		+"body{margin:0;padding: 0;background:white !important;color:#000 !important;}\n"
		+"@media print {.non-printing {display: none;}}\n"
		+"</style>"

const LICENSE = {
	name:'深圳浪腾计算机信息技术有限公司',
	code:'1D35EE3DAF89CE561392AA63B224FE43'
}

var CreatedOKLodop7766 = null
var LodopInstallHTML   = ''


function needCLodop(){
    try{
	var ua=navigator.userAgent;
	if (ua.match(/Windows\sPhone/i) !=null) return true;
	if (ua.match(/iPhone|iPod/i) != null) return true;
	if (ua.match(/Android/i) != null) return true;
	if (ua.match(/Edge\D?\d+/i) != null) return true;
	
	var verTrident=ua.match(/Trident\D?\d+/i);
	var verIE=ua.match(/MSIE\D?\d+/i);
	var verOPR=ua.match(/OPR\D?\d+/i);
	var verFF=ua.match(/Firefox\D?\d+/i);
	var x64=ua.match(/x64/i);
	if ((verTrident==null)&&(verIE==null)&&(x64!==null)) 
		return true; else
	if ( verFF !== null) {
		verFF = verFF[0].match(/\d+/);
		if ((verFF[0]>= 42)||(x64!==null)) return true;
	} else 
	if ( verOPR !== null) {
		verOPR = verOPR[0].match(/\d+/);
		if ( verOPR[0] >= 32 ) return true;
	} else 
	if ((verTrident==null)&&(verIE==null)) {
		var verChrome=ua.match(/Chrome\D?\d+/i);		
		if ( verChrome !== null ) {
			verChrome = verChrome[0].match(/\d+/);
			if (verChrome[0]>=42) return true;
		};
	};
        return false;
    } catch(err) {return true;};
}

function writeInstallHtml(html){
	LodopInstallHTML = html
}

//====获取LODOP对象的主过程：====
function getLODOP(oOBJECT, oEMBED) {
	LodopInstallHTML = ''
    var strHtmInstall = "<br><font color='#FF00FF'>打印控件未安装!点击这里<a href='http://s1.xiao360.com/lodop2017/install_lodop32.exe' target='_self'>下载并执行安装</a>,安装后请刷新页面或重新进入。</font>";
    var strHtmUpdate = "<br><font color='#FF00FF'>打印控件需要升级!点击这里<a href='http://s1.xiao360.com/lodop2017/install_lodop32.exe' target='_self'>下载并执行升级</a>,升级后请重新进入。</font>";
    var strHtm64_Install = "<br><font color='#FF00FF'>打印控件未安装!点击这里<a href='http://s1.xiao360.com/lodop2017/install_lodop64.exe' target='_self'>下载并执行安装</a>,安装后请刷新页面或重新进入。</font>";
    var strHtm64_Update = "<br><font color='#FF00FF'>打印控件需要升级!点击这里<a href='http://s1.xiao360.com/lodop2017/install_lodop64.exe' target='_self'>下载并执行升级</a>,升级后请重新进入。</font>";
    var strHtmFireFox = "<br><br><font color='#FF00FF'>（注意：如曾安装过Lodop旧版附件npActiveXPLugin,请在【工具】->【附加组件】->【扩展】中先卸它）</font>";
    var strHtmChrome = "<br><br><font color='#FF00FF'>(如果此前正常，仅因浏览器升级或重安装而出问题，需重新执行以上安装）</font>";
    var strCLodopInstall = "<br><font color='#FF00FF'>CLodop云打印服务(localhost本地)未安装启动!点击这里<a href='http://s1.xiao360.com/lodop2017/CLodop_Setup_for_Win32NT.exe' target='_self'>下载并执行安装</a>,安装后请刷新页面。</font>";
    var strCLodopUpdate = "<br><font color='#FF00FF'>CLodop云打印服务需升级!点击这里<a href='http://s1.xiao360.com/lodop2017/CLodop_Setup_for_Win32NT.exe' target='_self'>下载并执行升级</a>,升级后请刷新页面。</font>";
    var LODOP
    try {
        var isIE = (navigator.userAgent.indexOf('MSIE') >= 0) || (navigator.userAgent.indexOf('Trident') >= 0);
        if (needCLodop()) {
            try {
                LODOP = getCLodop()
            } catch(err) {};
            if (!LODOP && document.readyState !== "complete") {
                writeInstallHtml("C-Lodop没准备好，请稍后再试！")
                return false
            };
            if (!LODOP) {
                if (isIE) writeInstallHtml(strCLodopInstall)
                else LodopInstallHTML = strCLodopInstall + LodopInstallHTML
                return false
            } else {

                if (CLODOP.CVERSION < "2.1.0.2") {
                    if (isIE) writeInstallHtml(strCLodopUpdate)
                    else LodopInstallHTML = strCLodopUpdate + LodopInstallHTML
                };
                if (oEMBED && oEMBED.parentNode) oEMBED.parentNode.removeChild(oEMBED)
                if (oOBJECT && oOBJECT.parentNode) oOBJECT.parentNode.removeChild(oOBJECT)
            };
        } else {
            var is64IE = isIE && (navigator.userAgent.indexOf('x64') >= 0)
            //=====如果页面有Lodop就直接使用，没有则新建:==========
            if (oOBJECT != undefined || oEMBED != undefined) {
                if (isIE) LODOP = oOBJECT;
                else LODOP = oEMBED;
            } else if (CreatedOKLodop7766 == null) {
                LODOP = document.createElement("object")
                LODOP.setAttribute("width", 0)
                LODOP.setAttribute("height", 0)
                LODOP.setAttribute("style", "position:absolute;left:0px;top:-100px;width:0px;height:0px;")
                if (isIE) LODOP.setAttribute("classid", "clsid:2105C259-1E0C-4534-8141-A753534CB4CA")
                else LODOP.setAttribute("type", "application/x-print-lodop")
                document.documentElement.appendChild(LODOP)
                CreatedOKLodop7766 = LODOP
            } else LODOP = CreatedOKLodop7766
            //=====Lodop插件未安装时提示下载地址:==========
            if ((LODOP == null) || (typeof(LODOP.VERSION) == "undefined")) {
                if (navigator.userAgent.indexOf('Chrome') >= 0) LodopInstallHTML = strHtmChrome + LodopInstallHTML
                if (navigator.userAgent.indexOf('Firefox') >= 0) LodopInstallHTML = strHtmFireFox + LodopInstallHTML
                if (is64IE) writeInstallHtml(strHtm64_Install)
                else if (isIE) writeInstallHtml(strHtmInstall)
                else LodopInstallHTML = strHtmInstall + LodopInstallHTML
                return LODOP
            }
        }
        if (LODOP.VERSION < "6.2.1.7") {
            if (needCLodop()) LodopInstallHTML = strCLodopUpdate + LodopInstallHTML
            else if (is64IE) writeInstallHtml(strHtm64_Update)
            else if (isIE) writeInstallHtml(strHtmUpdate);
            else LodopInstallHTML = strHtmUpdate + LodopInstallHTML;
            return LODOP
        }
        //===如下空白位置适合调用统一功能(如注册语句、语言选择等):===
        //===========================================================
        return LODOP
    } catch(err) {
        LodopInstallHTML = "getLodop出错:" + err
        return false
    }
}

function getTplHtml(tpl,data){
	if(tpl.indexOf('v-for') === -1){
		tpl = tpl.replace('<tr class="nocolsborder">','<tr class="nocolsborder" v-for="item in bm">')
	}
	if(tpl.indexOf('/static/img/mpqr.jpg') !== -1){
		tpl = tpl.replace('/static/img/mpqr.jpg',data.bs.qrcode)
	}
	let html = tpl
	try{
		let res = Vue.compile(tpl)
	    let vm = new Vue({
	        data:data,
	        render:res.render,
	        staticRenderFns: res.staticRenderFns
	    })
	    let node = vm.$mount()
	    html = node.$el.outerHTML
	}catch(e){
		console.log(e)   
	}
	return html
}


export default {
	name:'Printer',
	mixins:[common,globals],
	data(){
		return {
			isDebug:false
		}
	},
	mounted(){
		
	},
	methods:{
		printBill(bill_type,data,copies,margin,preview,format){			
			preview = typeof preview == 'undefined' ? true:preview	
			let tpl = this.get_print_tpl(bill_type,format)			
						
			if(tpl.format == 3){				
				this.lprint(data,tpl,preview)
			}else{
				let content = getTplHtml(tpl.content,data)
				let width = tpl.format == 1?800:280 
				if(preview){
					this.print_preview
					.set('width',width)
					.set('info',content)
					.printView(data)
				}else{
					this.doPrint(bill_type,data,copies,margin,preview,format)
				}
			}
		},
		/**
		 * [printBill description]
		 * @param  {[type]} bill_type [单据类型1,收费,2退费,3等等]
		 * @param  {[type]} format    [格式:1,打白单,2:小票打印,3:套打]
		 * @param  {[type]} data      [数据对象{sys:bs:bm}]
		 * @param  {[type]} copies    [打印份数默认为1份]
		 * @param  {[type]} margin    [打印间距，默认为0]
		 * @param  {[type]} preview   [是否预览，对于套打有效]
		 * @return {[type]}           [description]
		 */
		doPrint(bill_type,data,copies,margin,preview,format){		
			preview = typeof preview == 'undefined' ? true:preview			
			copies  = copies  || 1
			margin  = margin  || 0
			let tpl = this.get_print_tpl(bill_type,format)
			if(!tpl){
				return false
			}
			if(format == 3){
				return this.lprint(data,tpl,preview)
			}else{
				let page = format===1?'a4':'fe'
				let cssLinks = ['/static/css/print.css']
				let html     = getTplHtml(tpl.content,data)
				let driver   = 'win'
				if(bill_type == 3){
					driver = 'lodop'
				}
				return this.print(
					[{
						content:html,
						margin:margin,
						times:copies
					}],
					cssLinks,
					page,
					driver
				)
			}
		},
		//套打
		lprint(data,tpl,preview){
			let row,
				p_items = [],
				s_items =[],
				ml_items = {},
				po = this.getLodop()
			if(!po){
				return false
			}
			preview = preview || true
            function _print_sitem(po,item,id,value){
                if(item.font_size){                	
                	item.font_size = item.font_size == 'inherit'?9:item.font_size
                    po.SET_PRINT_STYLE('FontSize',item.font_size);
                }else{
                    po.SET_PRINT_STYLE('FontSize',9);
                }
                if(_.isDefined(item.font_weight) && item.font_weight == 'bold'){
                    po.SET_PRINT_STYLE('Bold',1);
                }else{
                    po.SET_PRINT_STYLE('Bold',0);
                }
                if(_.isDefined(item.font_style) && item.font_style == 'italic'){
                    po.SET_PRINT_STYLE('Italic',1);
                }else{
                    po.SET_PRINT_STYLE('Italic',0);
                }
                if(_.isDefined(item.letter_spacing)){
                    po.SET_PRINT_STYLEA(id,'LetterSpacing',item.letter_spacing);
                }
                po.ADD_PRINT_TEXTA(id, item.top, item.left, item.width, item.height,value);
            }

            function _print_mitem(po,items,data,rowIndex){
                items.formEach((item,colIndex)=>{
                    var item_id = 'mitm_'+rowIndex+'_'+colIndex,
                        value   = _get_tpl_value(item,data),
                        new_item = util.copy(item);
                    new_item.top = new_item.top +  util.float(item.height) * rowIndex;
                    _print_sitem(po,new_item,item_id,value)
                })
            }

            function _get_tpl_value(item,data){
                let g = data  
                if(item.type == 'sys'){
                    g = data.sys
                }else if(item.type == 'bs'){
                    g = data.bs
                }else{
                	g = data.bm
                }

                if(typeof g == 'undefined'){
                    return ''
                }

                if(typeof g[item.field] != 'undefined'){
                    return g[item.field]
                }
                return ''
            }
            p_items = tpl.items
            for(let i = 0,l=p_items.length;i<l;i++){
                if(p_items[i].type == 'bm'){
                	row = p_items[i].row || 'items'
                    if(typeof ml_items[row] == 'undefined'){
                        ml_items[row] = [];
                    }
                    ml_items[row].push(p_items[i]);
                }else{
                    s_items.push(p_items[i]);
                }
            }

            po.PRINT_INIT(tpl.name||'')
            po.ADD_PRINT_SETUP_BKIMG('<img src="' + tpl.print_bg + '" />')
            po.SET_SHOW_MODE("BKIMG_IN_PREVIEW", 1)
            po.SET_PRINT_PAGESIZE(1, util.float(tpl.paper_width)*10, util.float(tpl.paper_height)*10, "")
            po.NewPage()
			
            s_items.forEach((item,index)=>{
                var item_id = 'sitm_'+index,
                    value   = _get_tpl_value(item,data);
                _print_sitem(po,item,item_id,value);
            })
            
			for(let items in ml_items){
				ml_items[items].forEach((item,row)=>{
					if(item.length > 0){
	                    if(_.isDefined(data.bm[row])){
	                        for(let i=0,l=data.bm[row].length;i<l;i++){
	                            data.bm[row][i].$index = i+1;
	                            _print_mitem(po,items,data.bm[row][i],i);
	                        }
	                    } 
	                }
				})
			}
            
            po.SET_PRINT_MODE("POS_BASEON_PAPER", 1);

            if(tpl.page){
                po.SET_PRINT_COPIES(util.int(tpl.page));
            }
            
           	let result = null
           
            if(preview){
                result = po.PREVIEW();
            }else{
                result = po.PRINT();
            }
           	if(result){
                this.$Message.success('打印成功!')
           	}else{
                this.$Message.error('打印失败!');
           	}
		},
		print(prints,cssLinks,page,driver){
			if(typeof driver == 'undefiend'){
				driver = 'win'
			}
			page = page?page:'a4'
			let padding = navigator.userAgent.indexOf('Firefox') === -1 ? "0.3cm" : "0"
			let stamp=new Date().getTime()
			let styles = ''
			let html = ''

			if(page == 'a4'){
				styles += style_landspace			
			}else{
				styles += style_fe
			}

			if(cssLinks){
				let links=''
				cssLinks.forEach(function(item){
					links+="<link type='text/css' rel='stylesheet' href='" + item +"?_="+stamp+ "' />"
				})
				styles += links
			}
			
			
			prints.forEach(function(p){
				let div = "<div style='page-break-after:always;padding:"+(p.margin||0)+"'>"
				div += "<div style='padding:"+padding+";'>"
				div += p.content.repeat(p.times||1)
				div += "</div></div>"
				html += div
			})

		

			if(driver == 'win'){
				let win = this.$el.contentWindow
				let doc=win.document
				doc.write(styles)
				doc.write(html)
				doc.close()
				setTimeout(function(){
					win.print()
				},1000)
			}
			if(driver == 'lodop'){
				
				this.getLodop().then(
					(po)=>{
						po.PRINT_INIT("打印预览");
						po.ADD_PRINT_HTM(0,0,'100%','100%',styles+html)
						po.PRINT()
					}
				)
			}

			
		},
		debug(flag){
			if(!flag) {
				this.isDebug = false
			}else{
				this.isDebug = true
			}
		},
		init_lodop(){		
			//====页面引用CLodop云打印必须的JS文件：====
			if (!window.LODOP && needCLodop()) {
				let head = document.head || document.getElementsByTagName("head")[0] || document.documentElement
				let oscript = document.createElement("script")
				oscript.src ="http://localhost:8000/CLodopfuncs.js?priority=1"
				head.insertBefore( oscript,head.firstChild )
				//引用双端口(8000和18000）避免其中某个被占用：
				oscript = document.createElement("script")
				oscript.src ="http://localhost:18000/CLodopfuncs.js?priority=0"
				head.insertBefore( oscript,head.firstChild )				
			}
		},
		getLodop(){			
            return new Promise((resolve,reject)=>{
	        	if(window.LODOP){
	        		resolve(window.LODOP)
	        	}else{
	        		this.init_lodop()
	        		setTimeout(()=>{
	        			let lodop = getLODOP()
	        			if(!lodop){
							this.error(LodopInstallHTML,
								'获取打印控件失败'
								)
							reject(LodopInstallHTML)
						}else{
							lodop.SET_LICENSES(LICENSE.name,LICENSE.code,'','');
							resolve(lodop)
						}
	        		},1000)
	        	}
				
	        })	
		},

		get_print_tpl(bill_type,format){
			let ret = {format:1,content:''}
			let print_tpls = this.$store.state.gvars.print_tpls
			let list = print_tpls.list
			let content   = print_tpls.default[bill_type][1].content
			let filter = null
            let filter_default = l=>{
                return (l.bid == 0 || l.bid == this.bid$) && l.bill_type == bill_type && l.format == format
            }
            if(bill_type == 3){
            	content = print_tpls.default[bill_type][2].content
            }
                        
            ret.content = content

            if(typeof format == 'undefined'){
                filter = (l)=>{
                    return (l.bid == 0 || l.bid == this.bid$) && l.bill_type == bill_type && l.is_default == 1
                }
            }else{
                filter = (l)=>{
                    return (l.bid == 0 || l.bid == this.bid$) && l.bill_type == bill_type && l.format == format
                }
            }
			if(list.length>0){					
				let result = print_tpls.list.find(filter)
                if(!result){
                    result = print_tpls.list.find(filter_default)                 
                }
				if(result) {
					ret.format = result.format
					ret.content = result.json.content
				}
			}
			
			return ret
		}

	},
	computed:{
		classes () {
            return [
                'printer',
                {
                  'printer-debug': this.isDebug
                }
            ]
        },
	}
}
</script>