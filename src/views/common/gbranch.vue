<template>
  <div class="gbranch" :style="{'z-index':show?1000:999}" v-show="branch.mode != ''" >
    <template v-if="branch_by_permit && branch_by_permit.length > 0">
	    <div class="show" @click="openChoose">
	      <div class="title title-single" v-if="branch.mode == 'single'">
	        <i class="icon-dizhi"></i>
	        <span>{{branch_name}}</span>
          <Tooltip :content="global_pj_name" v-if="global_pj_id != '0'" placement="bottom">
            <Icon type="ios-paper" :size="10"></Icon>
          </Tooltip>
	      </div>
	      <div class="title title-multi" v-if="branch.mode == 'multi'">
	        <i class="icon-dizhi"></i>
	        <span v-if="branch.ids.length > 1">已选择{{branch.ids.length}}个校区</span>
	        <span v-else>{{branch.ids[0]|branch_name}}</span>
	      </div>
	      <Icon type="arrow-down-b" v-if="!show"></Icon>
	      <Icon type="arrow-up-b" v-else></Icon>
	    </div>
	    <div class="choose animated fast" :class="{ slideInRight:show,slideOutRight:!show,chooseShow:show}">
      <template v-if="view_mode == 'branch'">
	      <div class="title" @click="showBranchSort">
	        选择校区
	        <Icon type="ios-gear"></Icon>
	      </div>
	      <div class="filter">
	        <Row>
	          <Col :span="companys.length>0?12:24">
	            <Input size="small" v-model="key" icon="search" clearable placeholder="按校区名称过滤"></Input>
	          </Col>
	          <Col span="11" offset="1" v-if="companys.length>0">
	            <Select size="small" v-model="company_id" clearable placeholder="按分公司过滤">
	              <Option v-for="item in companys" :value="item.dpt_id">{{item.dpt_name}}</Option>
	            </Select>
	          </Col>
	        </Row>
	      </div>
	      <div class="selall" v-if="branch.mode == 'multi'" @click="selAll">
	        <a :class="{'selected':isAllSelected}">
	          <Icon type="android-checkbox-outline-blank"></Icon>
	          <Icon type="android-checkbox"></Icon>
	          全选
	        </a>
	      </div>
	      <div class="list list-multi" v-if="branch.mode == 'multi'">
	        <div class="item" v-for="item in filterBranchs">
	          <a :class="{'selected':bids.indexOf(item.bid) !== -1}" @click="multiSel(item)">
	            <Icon type="android-checkbox-outline-blank"></Icon>
	            <Icon type="android-checkbox"></Icon>
	            {{item.short_name || item.branch_name}}
	          </a>
	        </div>
	        <p class="empty" v-if="filterBranchs.length == 0">没有搜索到匹配的校区</p>
	      </div>
	      <div class="list list-single" v-else> 
          <bitem 
          :branch="item"
          :sel-bid="bid"
          :bid-pj-ids-map="bid_pj_ids_map"
          @on-select="selectBranch"
          @on-sub="enterProjectView"
          v-for="(item,index) in filterBranchs"
          >
          </bitem>

	      </div>
	      <div class="footer">
	          <Button type="primary" size="small" @click="ok">确定</Button>
	          <Button type="text" size="small" @click="cancel">取消</Button>
	      </div>
      </template>
      <template v-if="view_mode == 'project'">
        <div class="title">
	        选择项目
          <a href="javascript:;" @click="backBranchView">返回</a>
	      </div>
        <div class="list list-single">
          <pitem 
          :project="item"
          :sel-pj-id="pj_id"
          @on-select="selectProject"   
          v-for="(item,index) in branchProjects">
          </pitem>
	      </div>         
        <div class="footer">
	          <Button type="primary" size="small" @click="setProject">确定</Button>
	          <Button type="text" size="small" @click="backBranchView">取消</Button>
	      </div>   
      </template>
	    </div>
	    <div class="mask" @click="autoHide" v-if="show"></div>
	
	    <Modal :mask-closable="false" v-model="modalBranchSort" ok-text="保存排序" @on-ok="saveBranchSort" title="校区显示排序">
	      <table class="table">
	        <thead>
	          <tr>
	            <th>序号</th>
	            <th>校区</th>
	            <th>排序</th>
	          </tr>
	        </thead>
	        <tbody>
	          <tr v-for="(item,index) in branch_by_permit">
	            <td>
	              {{index+1}}
	            </td>
	            <td>
	              {{item.short_name||item.branch_name}}
	            </td>
	            <td>
	              <Button size="small" type="ghost" shape="circle" icon="arrow-down-c" v-show="index < branch_by_permit.length-1" @click="branch_down(index)"></Button>
	              <Button size="small" type="ghost" shape="circle" icon="arrow-up-c" v-show="index > 0" @click="branch_up(index)"></Button>
	            </td>
	          </tr>
	        </tbody>
	      </table>
	    </Modal>
  	</template>
  </div>
</template>

<script>
import Vue from 'vue'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import util from '@/libs/util'
import directive from '@/libs/directive.mixin'
import store from '@/store'
import bitem from './gbranch-bitem.vue'
import pitem from './gbranch-pitem.vue'

export default {
  mixins:[ globals, common, directive ],
  name: 'gbranch',
  components: {
    bitem,
    pitem
  },
  created () {
    this.recoverBranch()
  },
  mounted(){
  	
  },
  data(){
    return {
      show:false,
      key:'',
      sellall:false,
      indeterminate:true,
      bid:0,
      bids:[],
      pj_id:0,
      pj_ids:[],
      modalBranchSort:false,
      company_id:-1,
      view_mode:'branch'
   
    }
  },
  computed:{
    branch(){
      return this.$store.state.branch
    },
    departments() {
      return this.$store.state.gvars.departments
    },
    branch_name () {
    	let branch = this.$store.state.gvars.branchs.find(b=>b.bid===this.branch.id)
      if(branch) {
        return branch.short_name||branch.branch_name
      }
    	return ''
    },
    branch_of_my() {
      let branchs = []
      this.branch_by_permit.forEach(item=>{
        branchs.push(item)
      })
      this.branch_by_project_charge.forEach(item=>{
        branchs.push(item)
      })

      return branchs
    },
    branch_by_permit() {
      let bids = this.bids_user,
          branchs = []
      if(this.$store.state.user.info.is_admin === 1){
        branchs = this.branchs
      }else{
        branchs = this.branchs.filter(b=>{
          return bids.indexOf(b.bid) !== -1
        })
      }
      return branchs
    },
    branch_by_project_charge() {
      let branchs = [],
          bids = this.bids_user,
          charge_pj_ids = this.user_charge_pj_ids,
          project_umap = this.$store.state.project.umap
      if(this.$store.state.user.info.is_admin == 1){
        return branchs
      }
      if(charge_pj_ids.length == 0){
        return branchs
      }
      branchs = this.branchs.filter(b=>{
        return bids.indexOf(b.bid) === -1 && typeof project_umap[b.bid] != 'undefined' && project_umap[b.bid].length > 0
      })
    
      return branchs
    },
    current_company() {
      let company = this.companys.find(c => c.dpt_id==this.company_id)
      return company || {}
    },
    companys() {
      let branchs = this.branch_by_permit,
          departments = this.departments.filter(d => d.dpt_type==2 || d.dpt_type==0 || branchs.findIndex(b => b.bid==d.bid) > -1),
          ret = []
      function findParent(data,pid,ret,d) {
        let parent = data.find(item => item.dpt_id==pid)
        if(parent) {
          if(parent.dpt_type==2) {
            let company = ret.find(r => r.dpt_id==parent.dpt_id)
            if(company) {
              company.bids.push(d.bid)
            }
          }else{
            findParent(data,parent.pid,ret,d)
          }
        }
      } 
      departments.forEach(d => {
        if(d.dpt_type==2) {
          d.bids = []
          ret.push(d)
        }
      })

      departments.forEach(d => {
        if(d.dpt_type==1){
          findParent(departments,d.pid,ret,d)
        }
      })
      
      return ret.filter(r=>r.bids.length>0)
    },
    filterBranchs(){
      let branchs = this.branch_of_my
      if(this.current_company.dpt_id) {
        let bids = this.current_company.bids
        branchs = branchs.filter(branch=>bids.findIndex(bid=>bid==branch.bid)>-1)
      }
      if(!/^\s*$/.test(this.key)){
        branchs = branchs.filter(
          b=>b.branch_name.indexOf(this.key) !== -1 || 
          b.short_name.indexOf(this.key) !== -1

          )
      }
      return branchs
    },
    isAllSelected(){
      return this.bids.length > 0 && this.bids.length >= this.filterBranchs.length
    },
    bid_pj_ids_map(){
      return this.$store.state.project.umap
    },
    branchProjects(){
      let bids_by_project_charge = []
      let branch_pj_ids = this.bid_pj_ids_map[this.bid]
      let user_pj_ids   = this.user_pj_ids
      let user_charge_pj_ids = this.user_charge_pj_ids
      let is_admin = this.is_admin
      let projects = []

      this.branch_by_project_charge.forEach(item=>{
        bids_by_project_charge.push(item.bid)
      })

      if(bids_by_project_charge.indexOf(this.bid) !== -1)
      {
          this.projects.forEach(item=>{
            if(user_charge_pj_ids.indexOf(item.pj_id) !== -1){
              projects.push(util.copy(item))
            }
          })
      }else{
          this.projects.forEach(item=>{
            if(
              branch_pj_ids.indexOf(item.pj_id) !== -1 && 
                (
                  user_pj_ids.indexOf(item.pj_id) !== -1 || 
                  is_admin
                )
              )
            {
              projects.push(util.copy(item))
            }
          })
      }
      
      return projects
    },
    global_pj_id(){
      return this.$store.state.project.id.toString()
    },
    global_pj_name(){
      let name = []
      let pj_id = this.global_pj_id
      let fn = this.$filter('pj_name')

      if(pj_id.indexOf(',') !== -1){
        let arr_pj_ids = pj_id.split(',')
        arr_pj_ids.forEach(jid=>{
          name.push(fn(jid))
        })
      }else{
        name.push(fn(pj_id))
      }
      return name.join(',')
    }
  },
  methods: {
    recoverBranch(){
      let bkey = 'branch-'+this.$store.state.user.info.uid,
      		branch = JSON.parse(Vue.localStorage.get(bkey))      		
            
      if(branch){
      	this.bid = branch.id
      	this.setBranchByPer(branch)
      }
      this.init_bid(this.bid)
    },
    setBranchByPer (branch) {
    	let mineBranch = this.branch_by_permit,
    			bid = this.bid,
    			branchIds = [],
    			mutationFunc = 'branchNoneMode',
    			result = []
    	
    	switch(branch.mode){
    		case 'multi':    			
    			if(branch.ids && branch.ids.length > 0){
	        	branch.ids.forEach(id=>{
	        		let index = mineBranch.findIndex(b=>b.bid==id)
	        		
	        		if(index > -1){
	        			branchIds.push(id)
	        		}
	        	})	        	
	        }   
	        
	        mutationFunc = 'setBranchIds'
    			break
    		case 'single':
    			if(mineBranch.findIndex(b=>b.bid==bid) > -1){
		    		branchIds = branch.id 
		    	}
    		
    			mutationFunc = 'setBranchId' 
    			break
    		case '':
    			break
    	}
    	if(branchIds.length == 0){
    		branchIds = this.bid = mineBranch[0].bid
    		
    		if(branch.mode == 'multi'){
    			branchIds = [branchIds]
    		}    		 		
    	}
    	
    	
    	store.commit(mutationFunc,branchIds)    	
    },
    init_bid(bid){
      this.bid = bid||this.$store.state.user.info.bid
      if(this.bids.indexOf(bid) === -1){
        this.bids.push(bid)
      }
    },
    openChoose(){
      this.show = true
      if(this.branch.mode == 'multi'){
        this.bids.splice(0)
        this.branch.ids.forEach(bid=>{
          this.bids.push(bid)
        })
      }
    },
    showBranchSort(){
      this.modalBranchSort = true
    },
    branch_up(index){
      this.$store.commit('branchUp',index)
    },
    branch_down(index){
      this.$store.commit('branchDown',index)
    },
    selectBranch(item){
      this.bid = item.bid
    },
    multiSel(item){
      let index = this.bids.indexOf(item.bid)
      if(index !== -1){
        this.bids.splice(index,1)
      }else{
        this.bids.push(item.bid)
      }
    },
    selAll(){
      if(this.isAllSelected){
        this.bids.splice(0,this.bids.length)
      }else{
        this.bids.splice(0,this.bids.length)
        this.filterBranchs.forEach(b=>{
          this.bids.push(b.bid)
        })
      }
      
    },
    handleSelAll () {
        if (this.indeterminate) {
            this.sellall = false
        } else {
            this.sellall = !this.sellall
        }
        this.indeterminate = false
        if (this.sellall) {
          this.bids.splice(0,this.bids.length)
          this.branchs.forEach(b=>{
            this.bids.push(b.bid)
          })
        } else {
          this.bids = []
        }
    },
    ok(){
      if(this.branch.mode == 'multi'){
        if(this.bids.length == 0){
          this.$Message.error('请选择校区!')
          return false
        }
        this.$store.commit('setBranchIds',this.bids)

      }else{
        if(this.bid == 0){
          this.$Message.error('请选择校区')
          return false
        }
        this.$store.commit('setBranchId',this.bid)
        this.$store.commit('setHttpHeaderPjId')
      }
      this.show = false
    },
    setProject(){
      this.$store.commit('setProjectId',this.pj_id)
      this.$store.commit('setHttpHeaderPjId')
      this.show = false
    },
    cancel(){
      this.show = false
    },
    toggleMode(){
      if(this.branch.mode == 'single'){
        this.$store.commit('branchMultiMode')
      }else{
        this.$store.commit('branchSingleMode')
      }
    },
    saveBranchSort(){
      this.$store.dispatch('branchSaveSort').then((res)=>{
        this.$Message.success('排序已保存!')
      })
    },
    autoHide(){
      if(this.branch.mode == 'single'){
        this.cancel()
      }
    },
    enterProjectView(){
      this.view_mode = 'project'
    },
    backBranchView(){
      this.view_mode = 'branch'
    },
    selectProject(item){
      if(this.pj_id == item.pj_id){
        this.pj_id = 0
      }else{
        this.pj_id = item.pj_id
      }
      
    }
  }
}
</script>

<style lang="less">
.gbranch{
  position:fixed;
  z-index:999;
  top:0;
  right:0;
  bottom:0;

  >.show{
    background: #fff;
    color: #666;
    position:fixed;
    width:150px;
    top:24px;
    right:250px;
    cursor:pointer;
    border:none;
    padding:0 5px;
    border-radius:4px;
    border: 1px solid #e5e5e5;
    &:hover{
      border-color: #57a3f3 !important;
      box-shadow: 0 0 0 2px rgba(45,140,240,.2)
    }
    >.title{
      height:30px;
      line-height:30px;
      overflow:hidden;
      >i{
        font-size: 20px;
        vertical-align: middle;
      }
      >span {
        vertical-align: middle;
      }
    }
    i.ivu-icon-arrow-down-b, i.ivu-icon-arrow-up-b{
      position:absolute;
      right:5px;
      top:10px;
      font-size:14px;
    }
  }

  >.choose{
    position:fixed;
    width: 260px;
    top: 55px;
    right:10px;
    z-index: 1001;
    border-radius: 2px;
    background-color: #fff;
    box-shadow: 0 4px 13px 0 rgba(0,0,0,.3);
    transform: translate3d(100%, 0, 0);
    &.chooseShow{
      transform: translate3d(0, 0, 0);
    }
    >.title{
      padding:5px 10px;
      font-size:14px;
      line-height:30px;
      border-bottom:1px solid #f2f2f2;
      margin-bottom:5px;
    }
    >.filter{
      padding:0 5px;
    }
    .selall{
      margin:5px 0;
      >a{
        display:block;
        line-height:30px;
        padding-left:10px;
        padding-right:10px;
        display:block;
        .ivu-icon-android-checkbox{
          display:none;
        }
        .ivu-icon-android-checkbox-outline-blank{
          display:inline;
        }

        &:hover{
          background:#eee;
        }
        &.selected{
          background:#eee;
          color:#00f;
          .ivu-icon-android-checkbox{
            display:inline;
          }
          .ivu-icon-android-checkbox-outline-blank{
            display:none;
          }
        }
      }
    }
    .list{
      margin-top:10px;
      margin-bottom:10px;
      max-height:300px;
      overflow-y:auto;
      p.empty{color:#999;}
      .item{
        position:relative;
        >a{
          display:block;
          line-height:26px;
          padding-left:10px;
          padding-right:10px;
          display:block;
          .ivu-icon-android-checkbox{
            display:none;
          }
          .ivu-icon-android-checkbox-outline-blank{
            display:inline;
          }

          &:hover{
            background:#eee;
          }
          &.selected{
            background:#2D8CF0;
            color:#fff;
            .ivu-icon-android-checkbox{
              display:inline;
            }
            .ivu-icon-android-checkbox-outline-blank{
              display:none;
            }
          }
        }
        .arr-project{
          display:block;
          width:24px;
          cursor:pointer;
          text-align:center;
          position:absolute;
          right:0;
          top:3px;
        }
      }
    }
    .list-multi{
      .ivu-checkbox-group{
        margin-left:10px;

      }
    }
    >.footer{
      padding:10px;
      border-top:1px solid #f2f2f2;
      text-align:right;
    }
  }

  >.mask{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index:1000;
    cursor: default;
    background-color: #000;
    opacity: .3;
  }
}

</style>
