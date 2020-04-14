<template>
  <navbar v-intro="'顶部这块区域可划分为3个部分，最左边是品牌LOGO区域，紧挨着LOGO的三横图标是一个切换左边菜单的按钮，右边分别是校区切换菜单，用户菜单，以及侧边栏切换按钮。'" v-intro-step="2" v-intro-tooltip-class="'left30'">
    <button class="navbar-toggler mobile-sidebar-toggler d-lg-none" type="button" @click="mobileSidebarToggle">&#9776;</button>
    <a class="navbar-brand" href="#" :style="{backgroundImage: 'url('+logo+')'}"></a>
    <ul class="nav navbar-nav d-md-down-none">
      <li class="nav-item">
        <a class="nav-link navbar-toggler sidebar-toggler" href="#" @click="sidebarMinimize">&#9776;</a>
      </li>
    </ul>
    <search-box></search-box>
    <service-task></service-task>
    <Icon class="ml-3 cursor nav-icon" type="alert-circled" size="18" :title="'你有'+showAttendanceWarning+'节课未考勤'" @click="attendance" v-if="showAttendanceWarning"></Icon>
    <chat-unread v-if="showChat"></chat-unread>
    <Icon class="ml-3 cursor nav-icon" type="ios-calculator" size="18" title="运营计算器" @click="calculator" v-if="show_calculator"></Icon>
    <Icon class="ml-3 cursor nav-icon" type="help-buoy" size="18" title="请求总部支持" @click="pullRequest" v-if="show_apply"></Icon>
    <upload-task></upload-task>
    <export-task/>
    <div class="nav navbar-nav ml-auto mr-2">

      <Dropdown :trigger="userMenuTrigger" :visible="visible" v-click-out="hideUserMenu" style="position: relative">
        <img v-if="userRank!=0" :src="rankingHeadImg" style="position: absolute;z-index: 1800;top: -10px;left: -2px;">
        <span class="cursor" @click="visible=!visible" style="position: relative;z-index: 1801">
          <Avatar size="small" :src="user.info.avatar" v-if="user.info.avatar != ''"></Avatar>
          <Avatar size="small" icon="person" v-else></Avatar>
          <Badge dot v-if="hasLatestVersion">
          <span class="d-md-down-none align-middle">{{user.info.name?user.info.name:user.info.account}}</span>
          </Badge>
          <span class="d-md-down-none align-middle" v-else>{{user.info.name?user.info.name:user.info.account}}</span>
          <Icon type="arrow-down-b" class="mr-2 align-middle"></Icon>
        </span>
        <DropdownMenu slot="list">
          <div v-intro="'这里是用户及系统菜单，点击这里“新手引导”菜单，可以重新观看新手引导'" v-intro-step="3" v-intro-tooltip-class="'top110'">
            <div class="dropdown-header text-center"><strong>{{user.info.account}}</strong></div>
            <DropdownItem @click.native="profile"><i class="fa fa-user"></i> 我的个人资料</DropdownItem>
            <DropdownItem @click.native="myfile"><Icon type="ios-folder"></Icon> 我的文件</DropdownItem>
            <DropdownItem  @click.native="rolesPermission"><i class="fa fa-gear"></i> 我的角色权限</DropdownItem>
            
            <DropdownItem :divided="true" @click.native="handover"><Icon type="arrow-swap"></Icon> 交班交款</DropdownItem>
            <DropdownItem @click.native="ranking"><Icon type="arrow-graph-up-left"></Icon> 业绩排行</DropdownItem>
            <DropdownItem @click.native="performance"><Icon type="podium"></Icon> 我的业绩</DropdownItem>
            
            <DropdownItem :divided="true" v-if="is_home" @click.native="guide"><Icon type="ios-lightbulb-outline"></Icon> 新手引导</DropdownItem>
            <DropdownItem @click.native="setup" v-if="showSetup"><Icon type="navicon"></Icon> 设置导航</DropdownItem>
            <DropdownItem @click.native="pullRequest" v-if="show_apply"><Icon type="help-buoy"></Icon> 请求总部支持</DropdownItem>
            
            <DropdownItem :divided="true" @click.native="about">
              <Icon type="more"></Icon> 
              <Badge dot v-if="hasLatestVersion">充值续费</Badge>
              <template v-else>
                充值续费
              </template>
            </DropdownItem>
            
            <DropdownItem :divided="true" @click.native="lock"><Icon type="lock-combination"></Icon> 锁定屏幕</DropdownItem>
            <DropdownItem @click.native="logout"><Icon type="log-out"></Icon> 退出</DropdownItem>
          </div>
        </DropdownMenu>
      </Dropdown>
      <theme-switch></theme-switch>
    </div>
    <button ref="asideBtn" class="navbar-toggler aside-menu-toggler d-md-down-none" type="button" @click.prevent="asideToggle">&#9776;</button>
  </navbar>
</template>
<script>

import {_} from '@/libs/util'
import navbar from './Navbar'
import store from '@/store'
import common from '@/libs/common.mixin'
import directive from '@/libs/directive.mixin'
import moment from 'moment'

import ThemeSwitch from './theme-switch.vue'
import SearchBox from './search-box.vue'
import ServiceTask from './service-task.vue'
import UploadTask from './upload-task.vue'
import ExportTask from './export-task.vue'
import ChatUnread from './chat-unread.vue'

import guanjun from '@/img/ranking/guanjun-head.png'
import yajun from '@/img/ranking/yajun-head.png'
import jijun from '@/img/ranking/jijun-head.png'

export default {
  name: 'appheader',
  mixins:[common,directive],
  components: {
    navbar,
    ThemeSwitch,
    SearchBox,
    UploadTask,
    ServiceTask,
    ExportTask,
    ChatUnread
  },
  filters:{
    branch_name(bid,arg2,arg3){
      let name = ''
      let branchs = store.getters.getGlobalVar('branchs')
      if(branchs){
        for(let i=0,l=branchs.length;i<l;i++){
          if(bid == branchs[i].bid){
            name = branchs[i].short_name || branchs[i].branch_name
            break
          }
        }
      }
      return name
    }
  },
  mounted () {
    this.hideMenu = document.body.classList.value.indexOf('sidebar-minimized')>-1
    this.checkLatestVersion()
    this.getAttendanceWarning()
    this.getUserRanking()
  },
  data(){
    return {
      show_branchs:false,
      tId: null,
      visible: false,
      userMenuTrigger:'custom',
      outclick:true,
      showUserMenu:true,
      hideMenu: false,
      showAttendanceWarning: false,
      userRank: 0
    }
  },
  watch: {
  	'$store.state.is_siderbar_min':{
  		handler: function (val) {
				this.hideMenu = document.body.classList.value.indexOf('sidebar-minimized')>-1
			},
			deep: true
  	}
  },
  computed:{
    showChat() {
      return this.is_app_chat_open && this.hasPer('student.chat')
    },
    // 运营计算器admin、校长、督导显示
    is_master() {
      const RIDMASTER = 3
      const RIDDIRECT = 102
      return (this.is_admin 
            || this.rids_user.indexOf(RIDMASTER) > -1
            || this.rids_user.indexOf(RIDDIRECT) > -1)
    },
    show_calculator() {
      let client = this.$store.state.client
      return this.is_master && 
             client.og_id  == 0 && 
             client.is_org_open == 1 &&
             client.allow_sub_org_type == 1
    },
    show_apply() {
      // return this.is_orgs&&this.is_master
      let client = this.$store.state.client
      return (
            client.og_id == 0 &&
            client.is_org_open == 1 &&
            client.allow_sub_org_type == 1 &&
            client.head_support_open
            ) || 
            (
              client.og_id > 0 &&
              client.parent_head_support_open == 1
            )
    },
    user(){
      return this.$store.state.user
    },
    is_home() {
      return this.$route.path === '/dashboard/home' ? true : false
    },
    logo () {
    	let ui = window.CLIENT_PARAMS,
    			result = '',
          logo_key = this.hideMenu?'small_logo':'big_logo'
    	if(!_.isEmpty(ui) && !_.isEmpty(ui.pc[logo_key])){ 
          result = ui.pc[logo_key]       		
    	}else{
    		result = this.hideMenu?'http://s1.xiao360.com/x360p/images/logo-1.min.png':'http://s1.xiao360.com/x360p/images/logo-1.png'
    	}
    	return result
    },
    showSetup () {
      let is_admin = this.user.info.is_admin,
          employee = this.user.info.employee
      return is_admin === 1 || employee && employee.rids.indexOf(10) > -1
    },
    hasLatestVersion(){
      return this.$store.state.latest_version.ver != '' && this.$store.state.latest_version.read == 0
    },
    rankingHeadImg() {
      let userRank = this.userRank;
      if(userRank == 1) {
        return guanjun
      }
      else if(userRank == 2) {
        return yajun
      }
      else if(userRank == 3) {
        return jijun
      }
    }
  },
  methods: {
    getUserRanking() {
      this.$http.get('dashboard/receipt_ranking?type=month')
      .then(res => {
          var list = res.body.data.list;
          for (let index = 0; index < list.length; index++) {
            let item = list[index];
            if(item.eid == this.eid$) {
              if(index < 3) {
                this.userRank = index+1;
                break;
              }
            }
          }
      },res => {
          this.$Message.error(res.body.message)
      })
    },
    getAttendanceWarning() {
      this.$http.get('dashboard/attendance_warning',{
          params: {
            int_day: moment().format('YYYY-MM-DD')
          }
      })
      .then(res => {
          var list = res.body.data.list;
          if(list.attendance_no > 0) {
            this.showAttendanceWarning = list.attendance_no;
          }
      },res => {
          this.$Message.error(res.body.message)
      })
    },
    pullRequest () {
      // this.$Modal.open('app/franchisees/service/apply-modal.vue')
      // .then(modal => {
      //   modal.show('服务申请','add')
      // })
      this.$router.push({path: '/support'})
      this.visible = false
    },
  	calculator () {
			this.$Modal.open("app/modal/operation-calculator-modal.vue")
			.then(modal=>{
				modal.show('运营计算器')
			})
		},
  	attendance () {
      this.$router.push('/business/arrange/lists?is_attendance=0')
		},
  	myfile () {
			this.$router.push({path:'/filepackage'})
			this.visible = false
  	},
    checkLatestVersion(){
      this.$rest('system/latestversion').get()
      .success(list=>{
        if(list.length > 0){
          this.$store.commit('setLatestVersion',list[0])
        }
      })
    },
  	rolesPermission () {
  		this.$router.push({path: '/dashboard/roles'})
  	},
    performance () {
      this.$router.push({path :'/performance'})
    },
    guide() {
      this.$Modal.open('common/modal/guide-confirm.vue@modal',{autoShow:true})
    },
    handleOpen() {
      
      this.visible = true
    },
    handleClose() {
      this.visible = false
    },
    forceOpen(){
      setTimeout(()=>{
        this.visible = true
      },100)
    },
    hideUserMenu(){
      if(this.outclick){
        this.visible = false
      }
    },
    openUserMenuOutClick(){
      this.outclick = true
    },
    closeUserMenuOutClick(){
      this.outclick = false
    },
    setup() {
      this.$store.state.layout.showSet()
      this.visible = false
    },
    about() {
      this.$store.state.layout.showAbout()
      this.visible = false
    },
    hideBranchs(){
      this.show_branchs = false
    },
    toggleBranchs(){
      this.show_branchs = !this.show_branchs
    },
    switchBranch(item){
      this.$store.dispatch('switchUserBranch',item)
      this.show_branchs = false
    },
  	lock () {
  		this.$router.push({path:'/lock',query:{backurl:this.$route.path}})
      this.visible = false
  	},
    handover () {
      this.$router.push({path:'/dashboard/handover'})
      this.visible = false
    },
    ranking () {
      this.$Modal.open('common/modal/ranking.vue@modal')
      .then(modal => {
        modal.show('排行榜')
      })
    },
    profile() {
      this.$router.push({path:'/profile'})
      this.visible = false
    },
    logout() {
      this.$router.push({path:'/logout'})
    },
    sidebarToggle (e) {
      e.preventDefault()
      document.body.classList.toggle('sidebar-hidden')
    },
    sidebarMinimize (e) {
      e.preventDefault()
      document.body.classList.toggle('sidebar-minimized')
      this.hideMenu = document.body.classList.value.indexOf('sidebar-minimized')>-1
      
      clearTimeout(this.tId)
      this.tId = setTimeout(()=>{
        this.$store.commit('changeSiderbar')
      }, 205)
    },
    mobileSidebarToggle (e) {
      e.preventDefault()
      document.body.classList.toggle('sidebar-mobile-show')
    },
    asideToggle () {
      //e.preventDefault()
      document.body.classList.toggle('aside-menu-hidden')
      setTimeout(()=>{
        this.$store.commit('changeAside')
      }, 205)
      this.$refs.asideBtn.blur()
    }
  }
}
</script>
<style lang="less">
  .nav.navbar-nav {
    .ivu-dropdown-item {
      a > {
        color: #536c79;
      }
    }
  }
  .nav-icon {
  	&:hover{
  		color:#39f
  	}
  }
</style>

