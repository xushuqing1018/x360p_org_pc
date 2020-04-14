<template>
    <data-ready ref="dr" :data="gurls" @ready="dataReady" @error="dataError" from-layout>
        <div class="app bg-gray" :class="[hideAppSide?'only-dashboard':'',theme]">
            <gtip v-if="showGTip"/>
            <appheader ref="appHeader" />
            <div class="overflow-hidden">
	            <div class="app-body">
	                <sidebar ref="sideBar" v-intro="'左边这块区域是功能导航区,每个登录用户根据自己拥有的菜单权限不同，所能看到的功能菜单也不一样。'" v-intro-step="1" v-intro-tooltip-class="'top30'"/>
	                <main class="main">
	                    <breadcrumb :list="list"/>
	                    <div class="container-fluid route-main">
	                        <router-view></router-view>
	                    </div>
	                </main>
	                <appaside ref="appAside" v-intro="'这块侧边栏是考勤看板区，当天的考勤汇总和排课在这里展现，当学员用学员卡进行刷卡考勤时，此面板会自动展开，并实时的刷新考勤数据。'" v-intro-step="4"/>
	            </div>
            </div>
            <appfooter ref="appFooter"/>
            <gbranch ref="gbranch" />
            <card-reader ref="cardReader" @reader="cardReaderHandler" @barcode="barAttendance"></card-reader>
        </div>
        <printer
        ref="printer"
        >
        </printer>
        <print-preview ref="print_preview"></print-preview>
        
    	<!--导出excel的a标签-->
    	<a id="hrefToExportTable" style="position: absolute;left: -10px;top: -10px;width: 0px;height: 0px;"></a>
    	<picture-preview ref="picturePreview"></picture-preview>
        <system-status ref="ref_system" :mode="status" @close="showGuideModal"></system-status>
        
        <modal-view></modal-view>
        <chat-box ref="chatbox"></chat-box>
        <web-call :caller="user" ref="webcall"></web-call>
        <x-upload multiple ref="xupload" @on-mounted="setUploadList" :on-success="handleSuccess" :show-upload-list="false" v-show="false"></x-upload>
        <BackTop></BackTop>
    </data-ready>
</template>

<script>
    import Vue 				from 'vue'
    import util 			from '@/libs/util'
    import Bus 				from '@/bus.js'
    import Appheader 		from './common/header.vue'
    import Sidebar 			from './common/sidebar.vue'
    import Appaside 		from './common/aside.vue'
    import Appfooter 		from './common/footer.vue'
    import Breadcrumb 		from './common/breadcrumb.vue'
    import Gbranch 			from './common/gbranch.vue'
    import Gtip 			from './common/gtip.vue'
    import DataReady 		from 'c%/DataReady.vue'
    import CardReader 		from 'c%/CardReader.vue'
    import Printer 			from 'c%/Printer.vue'
    import PrintPreview 	from 'c%/PrintPreview.vue'
    import PicturePreview 	from 'c%/PicturePreview.vue' 
    import SystemStatus 	from './common/modal/system-status.vue'
    import AvatarAndName 	from 'c%/AvatarAndName.vue'
    import WebCall 			from 'c%/WebCall.vue'
	import XUpload 			from 'c%/xupload/index'
    import ChatBox          from 'v%/business/student/chat.vue'
	
    Vue.component('avatar-and-name',AvatarAndName)
    export default {
        name:'layout',
        components: {
        	XUpload,
            Appheader,
            Sidebar,
            Appaside,
            Appfooter,
            Breadcrumb,
            Gbranch,
            DataReady,
            CardReader,
            Printer,
            WebCall,
            PrintPreview,
            PicturePreview,
            SystemStatus,
            Gtip,
            ChatBox
        },
        data(){
            return {
                gurls:['global/all'],
                status: '',
                currentFileList: []
            }
        },
        computed: {
            showGTip() {
                return this.$store.state.gtip.show;
            },
        	hideAppSide () {
        		let navs = this.$store.state.user.info.navs.main        		
        		
        		return navs.length===0
        	},
            name() {
                return this.$route.name
            },
            list() {
                return this.$route.matched
            },
            theme() {
                return this.$store.state.app.theme
            },
            user () {
		      	return this.$store.state.user
		    },
		    uploadTask () {
		    	return this.$store.state.upload.upload_task
		    },
		    print_attendance_bill () {
		    	let result = 0
		    	
		    	if(this.$store.state.gvars.configs.params){
		    		result = this.$store.state.gvars.configs.params.class_attendance.print_attendance_bill
		    	}
		    	
		    	return result
		    },
            is_org () {
                return this.$store.state.user.info.og_id > 0
            },
            org_type () {
                let org = this.$store.state.user.info.org
                if(org&&org.org_type) {
                    return org.org_type
                }
                return 1
            }
        },
        created(){
            this.$store.commit('setLayout',this)
        },
        watch:{
            '$route.path':function(val,oldVal){

                this.$store.dispatch('updateRouterHelp',val)
                
				if(this.is_org && this.org_type == 2){
					if(
					val.indexOf('/recruiting/market/') === -1 
                    && val.indexOf('/dashboard/') === -1
                    && val.indexOf('course_standard_file') === -1
                    && val.indexOf('/support') === -1
					&& !/^\/[^\/]+$/.test(val)){
						this.$router.replace({ path: '/support' })
					}
				}
                if(val.indexOf('/support') === -1){
                    this.checkSystemExpire()
                }
				
				
            }
        },
        methods:{
        	setUploadList () {
        		if(this.$refs.xupload){
        			this.currentFileList = this.$refs.xupload.fileList        			
        		}
        	},
        	handleSuccess (res,file) {        		
        		let tasks = util.copy(this.uploadTask)
        		let obj = {
        			name: file.name,
        			size: file.size,
        			file_id: res.data.file_id,
	        		file_url: res.data.file_url,
	        		file_type: res.data.file_type,
	        		media_type: res.data.media_type
        		}
        		tasks.push(obj)
        		this.$store.commit('updateUploadTask',tasks)
        	},
            checkSystemExpire(){
                let client      = this.$store.state.client,
                    is_init_pay = client.is_init_pay,
                    is_expire   = client.is_expire,
                    is_frozen   = client.is_frozen
                if(is_init_pay === 0) {
                    this.status = 'init-pay'
                }else if(is_expire) {
                    this.status = 'expire'
                }else if(is_frozen === 1) {
                    this.status = 'frozen'
                }
                if(!is_init_pay||is_expire||is_frozen) {
                    this.$refs.ref_system.show()
                }
            },
            checkSystemSataus() {
                let client      = this.$store.state.client,
                    is_init_pay = client.is_init_pay,
                    is_expire   = client.is_expire,
                    is_frozen   = client.is_frozen
                if(is_init_pay === 0) {
                    this.status = 'init-pay'
                }else if(is_expire) {
                    this.status = 'expire'
                }else if(is_frozen === 1) {
                    this.status = 'frozen'
                }
                if(!is_init_pay||is_expire||is_frozen) {
                    this.$refs.ref_system.show()
                }else{
                    this.showGuideModal()
                }
            },
            showGuideModal() {
                let gv = Vue.localStorage.get('guide_visited')
                if(gv===null || gv==0 && this.$route.path==='/dashboard/home') {
                    this.$Modal.open('common/modal/guide-confirm.vue@modal',{autoShow:true})
                }else{
                    if(this.org_type!==2) {
                        this.isSetup()
                    }
                }
            },
            startGuide() {
                let intro = new introJs()
                intro.setOptions({
                    prevLabel: "上一步", 
                    nextLabel: "下一步",
                    skipLabel: "关闭",
                    doneLabel: "完成",
                    tooltipPosition: 'auto',
                    exitOnOverlayClick:false
                })
                intro.onbeforechange((targetElement) => {
                    let step = intro._currentStep + 1
                    if(step == 1){
                        document.body.classList.add('intro-number-right')
                    }
                    if(step == 2){
                        document.body.classList.remove('intro-number-right')
                        document.body.classList.add('intro-number-inner')
                        this.$refs.appHeader.forceOpen()
                    }
                    if(step == 3) {
                        document.body.classList.remove('intro-number-inner') 
                    }
                    if(step == 4){
                        this.$refs.appHeader.handleClose() 
                    }
                })

                intro.onafterchange((targetElement)=>{
                   let step = intro._currentStep + 1
                   if(step == 3){
                        if(document.body.classList.contains('aside-menu-hidden')) {
                            this.$refs.appHeader.asideToggle()
                        } 
                   }
            
                })
                intro.onexit(() => {
                    document.body.classList.remove('intro-number-right')
                    document.body.classList.remove('intro-number-inner') 
                    this.$refs.appHeader.openUserMenuOutClick()
                    this.isSetup()
                })
                this.$refs.appHeader.closeUserMenuOutClick()
                intro.start()
            },
            showAbout() {
                this.$Modal.open('common/modal/about.vue@modal')
                .then(modal=>{
                    modal.vuec.show(this.is_org?'关于系统':'关于校360','about')
                })
            },
            showSet() {
                this.$Modal.open('common/modal/setup.vue@modal')
                .then(modal=>{
                    modal.vuec.show('初始化设置', 'setting')
                })
            },
            isSetup() {
                this.$rest('issetup')
                .get()
                .success(response => {
                    if(!response.is_setup) {
                        this.showSet()
                    }
                })
                .error(response => {
                    console.log(response)
                })
            },
            dataReady(rs){
                this.$nextTick(() => {
                    this.checkSystemSataus()
                })
                this.$store.commit('setGlobalVars',rs[0])
                this.$store.dispatch('updateGlobalVar','employees')
                .then(()=>{
                    this.$store.dispatch('updateGlobalVar','areas')
                    .then(()=>{
                        this.$store.dispatch('updateGlobalVar','review_tpl_setting')
                        .then(()=>{
                            this.$store.dispatch('updateGlobalVar','review_tpl_define')
                        })
                    })
                })
                
            },
            // 处理刷卡
            cardReaderHandler({cardNo,action}){
                let classList = document.body.classList
                let path = this.$route.path
                
                if(action&&action=='issue') {
                    Bus.$emit('issue-card',cardNo)
                    return
                }
                if(action&&action=='notice') {
                    Bus.$emit('school-notice',{cardNo,action})
                    return
                }
                this.attendance({cardNo,action})
            },
            schoolNotice ({cardNo,action}) {
            	//到离校通知            	
            	this.$rest('student_attend_school_logs/swipe_card?card_no='+cardNo)
            	.get()
            	.success(data=>{
            		this.$Message.success('刷卡成功！')
            		this.$store.commit('updateCard')
            	})
            	.error(response => {
                    this.$Notice.error({
                        title: '刷卡失败',
                        desc: response.body.message||'刷卡失败'
                    })
                })
            },
            attendance ({cardNo,action}) {
            	let classList = document.body.classList
            	//刷卡考勤
            	this.$rest('swiping_card_records')
                .post({card_no: cardNo})
                .success(response => {
                    let data = response.data
                    this.doAttendancePrint(data.satt_id)
                    this.$Notice.success({
                        title: data.msg,
                        desc: data.student.student_name
                    })
                    if(classList.contains('aside-menu-hidden')) {
                        classList.toggle('aside-menu-hidden')
                        this.$store.commit('changeAside')
                    }
                    this.$refs['appAside'].tab = 'attendance'
                    this.$refs['appAside'].$refs.Attend.attendStu = {}
                    this.$refs['appAside'].$refs.Attend.init_data()
                    clearTimeout(this.tId)
                    this.tId = setTimeout(() => {
                        this.$refs['appAside'].$refs.Attend.isEmpty = false
                        this.$refs['appAside'].$refs.Attend.attendStu = data
                    },250)
                    Vue.localStorage.set('__attendance__',JSON.stringify(response.data))
                })
                .error(response => {
                    let desc = '',
                    	message = response.body.data?response.body.data.message:response.body.message
                    if(response.body.data&&response.body.data.student){
                        desc = response.body.data.student.student_name
                    }
                    desc += message;
                    this.$Notice.error({
                        title: '考勤失败',
                        desc: desc
                    })
                })
            },
            barAttendance (card) {
                this.$rest('swiping_code_records')
                .post({
                    code: card
                })
                .success(res => {
                    this.$Notice.success({
                        title: `${res.data.student.student_name}：${res.data.msg}`,
                        desc: res.data.class_name,
                        duration: 5
                    })
                })
                .error(res => {
                    this.$Notice.error({
                        title: '扫码考勤失败',
                        desc: res.body.message,
                        duration: 5
                    })
                })
            },
            doAttendancePrint (satt_id) {     
            	if(!this.print_attendance_bill){
            		return
            	}
            	
            	this.$rest(`student_attendances/do_print?satt_id=${satt_id}`)
            	.get()
            	.success(data=>{
            		this.$refs.printer.printBill(3,data,1,'0 0 0 0',false)
            	})
            },
            dataError(error){
                this.$store.commit('clearLoginInfo')
                this.$router.replace('/login')
            }
        }
    }
</script>