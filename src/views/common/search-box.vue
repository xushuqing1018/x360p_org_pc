<style scoped>
.navbar-search {
	position: relative;
}

.tag-manage-panel {
	width: 450px;
	height: 265px;
	position: absolute;
	top: 38px;
	background-color: rgba(255,255,255,.9);
	box-shadow: 0 1px 6px rgba(0,0,0,.2);
	border-radius: 4px;
	z-index: 1800;
}

.tag-manage-mask {
	width: 100vw;
	height: 100vh;
	position: fixed;
	top: 0px;
	left: 0px;
	background-color: rgba(255,255,255,0);
	z-index: 1799;
}

.tag-menu {
	position: absolute;
	top: 0px;
	left: 0px;
}

.tag-menu >>> .ivu-menu-item {
	padding: 14px 15px;
}

.tag-content {
	width: 395px;
	height: 265px;
	box-sizing: border-box;
	padding: 15px;
	position: absolute;
	top: 0px;
	left: 55px;
	overflow-y: auto;
}

.tag-menu >>> .ivu-menu-item {
	font-size: 13px;
}

.top-dot {
    width: 18px;
    height: 18px;
    background-color: #ed3f14;
    position: absolute;
    top: -6px;
    left: -6px;
    border-radius: 50%;
    font-size: 11px;
    color: white;
    z-index: 1;
    line-height: 18px;
    text-align: center;
}

.tag {
    margin-right: 10px;
    height: 28px;
    line-height: 28px;
    margin-bottom: 10px;
}

.tag-box {
	position: relative;
	display: inline-block;
	margin-right: 5px;
	margin-bottom: 5px;
}

.no-tag {
    color: #39f;
    margin-bottom: 10px;
}

.add-tag-box {
    margin-top: 5px;
}

.add-tag-box >>> input {
    height: 28px;
}

.add-tag-box >>> button {
    padding: 4px 10px;
}

.add-tag-box >>> .ivu-select-selection {
    height: 28px;
}

.add-tag-box >>> .ivu-select-selected-value {
    height: 28px;
    line-height: 28px;
}

.add-tag-box >>> .ivu-select-item {
    padding: 7px 10px;
}

.add-input-box {
    width: 100px;
    display: inline-block;
}

.tag-color-dot {
    margin-left: 5px;
    position: relative;
    top: 2px;
}

.close-btn {
	position: absolute;
	top: 0px;
	right: 0px;
	z-index: 1000;
}
</style>


<template>
	<div class="navbar-search">
		<div class="tag-manage-mask" v-if="showTagPanel&&hasCheckTagPer" @click="showTagPanel=false"></div>
		<transition name="slide-up">
			<div class="tag-manage-panel" v-if="showTagPanel&&hasCheckTagPer">
				<Menu ref="tag_menu" mode="vertical" @on-select="changeTagType" :active-name="tagType" style="width: 45px;height: 265px;" class="tag-menu">
					<MenuItem :name="1" v-if="hasPer('business.student')">
						学员
					</MenuItem>
					<MenuItem :name="3" v-if="hasPer('recruiting.list')">
						客户
					</MenuItem>
					<MenuItem :name="2" v-if="hasPer('business.class')">
						班级
					</MenuItem>
					<!-- <MenuItem :name="4">
						排课
					</MenuItem> -->
				</Menu>
				<div class="tag-content" v-loading="'tags'">
					<template v-if="tagList.length != 0">
						<div v-for="(item,index) in tagList" class="tag-box" :title="item.total+'个'+name_map[tagType-1]">
							<div class="top-dot cursor" @click="editTag(item)" v-if="action=='edit'"><Icon type="edit"></Icon></div>
							<div class="top-dot" v-else>{{item.total}}</div>
							<Tag :closable="action=='delete'" @on-close="deleteTag" :color="item.color" @click="tagFilter(item)" :name="item.tag_id" class="tag">{{item.tag_name}}</Tag>
						</div><br/>
						<Button type="text" size="small" @click="toggleEdit">{{action=='edit'?'完成':'编辑'}}</Button>
						<Button type="text" size="small" @click="toggleDelete">{{action=='delete'?'完成':'删除'}}</Button>
					</template>
					<div class="no-tag" v-else>暂无标签~</div>
				</div>
			</div>
		</transition>
		<Input
			v-model.trim="search_key" 
			:placeholder="search_placeholder" 
			icon="ios-search" 
			style="width: 200px;"
			@on-blur="focus=false"
			@on-focus="focus=true"
			@click.native="toggleTagPanel">
		</Input>
		<transition name="slide-up">
			<div class="ivu-select-dropdown navbar-search-dropdown" v-show="dropVisible">
				<ul class="ivu-dropdown-menu">
					<template v-if="is_tel">
						<li :class="['ivu-dropdown-item',{['not-found']:tel_relate.length == 0}]">
							<Icon type="ios-telephone"></Icon>
							<span v-if="tel_relate.length>0" @click="showTelInfo">与{{search_key}}相关
								<span style="font-size: 14px;color: #ed3f14">{{tel_relate.length}}</span>
								<span>条信息</span>
							</span>
							<span v-else>无与{{search_key}}相关的信息</span>
						</li>
					</template>
					<template v-else>
						<li 
							class="ivu-dropdown-item not-found" 
							v-if="tagType==1&&notFoundFun">
							<Icon type="information-circled"></Icon>无与{{search_key}}相关的功能
						</li>
						<li 
							:class="['ivu-dropdown-item',tagType==1&&item.index==0?'ivu-dropdown-item-divided':'']" 
							v-for="(item,index) in data" 
							@click="clickItem(item)">
							<Icon :type="rightIcon(item)"></Icon>{{item.text}}
						</li>
						<li 
							class="ivu-dropdown-item not-found ivu-dropdown-item-divided" 
							v-if="notFound">
							<Icon type="information-circled"></Icon>无与{{search_key}}相关的{{name_map[this.tagType-1]}}
						</li>
					</template>
				</ul>
			</div>
		</transition>
	</div>
</template>
<script>
	import util from '@/libs/util'
	import common from '@/libs/common.mixin'
	import pinyin from '@/libs/pinyin'
	export default {
		mixins: [common],
		data() {
			return {
				search_key: '',
				data: [],
				tel_relate: [],
				focus: false,
				showTagPanel: false,
				tagList: [],
				tagType: 1,
				name_map: ['学员','班级','客户','排课'],
				currentTagId: 0,
				action: 'list',
				loading: false,
				path_map: {3:'/recruiting/list/customer',1:'/business/student/archive',2:'/business/class/list'},
				type_map: {3:'customer',1:'student',2:'class'}
			}
		},
		filters:{
		    uri:function(item){
		    	let uri = item.data
		    	if(item.parent && item.data.indexOf(item.parent) == -1) {
		    		uri = item.parent+'.'+item.data
		    	}
		      	return '/'+uri.replace(/\./g,'/')
		    }
	  	},
		computed: {
			hasCheckTagPer() {
				return this.hasPer('recruiting.list')||this.hasPer('business.student')||this.hasPer('business.class')
			},
			dropVisible() {
				if(this.search_key !== '' 
					&& this.focus 
					&& !this.loading) return true;
				return false
			},
			routes() {
				let navs = this.$store.state.gvars.navs.main,
					routes = []
				navs.forEach(nav => {
					this.loopPush(nav,routes)
				})
				return routes
			},
			notFoundFun() {
				return this.data.filter(item => item.type == 'route').length == 0
			},
			notFound() {
				let type = this.type_map[this.tagType]
				return this.data.filter(item => item.type == type).length == 0
			},
			is_tel() {
				return (/^\d{8,11}$/).test(this.search_key)
			},
			search_placeholder() {
				let type = this.tagType
				if(type == 1) {
					return '搜索功能/学员' 
				}
				else if(type == 2) {
					return '搜索班级'
				}
				else {
					return '搜索客户'
				}
			}
		},
		mounted() {
			let tag_id = this.$route.query.tag_id
			if(tag_id) {
				this.currentTagId = tag_id
			}
		},
		methods: {
			editTag(item) {
				this.$Modal.open('tag/info-modal.vue',{
					on: {
						'on-success':() => {
							this.initTagData()
						}
					}
				})
				.then(modal => {
					modal
					.set('info',item)
					.show(util.sprintf('编辑标签【%s】',item.tag_name))
				})
			},
			toggleEdit() {
				this.action == 'edit' ? this.action = 'list' : this.action = 'edit'
			},
			toggleDelete() {
				this.action == 'delete' ? this.action = 'list' : this.action = 'delete'
			},
			tagFilter(item) {
				let name = this.path_map[this.tagType]
				if(this.currentTagId == item.tag_id) {
					this.currentTagId = 0
				}
				else {
					this.currentTagId = item.tag_id
				}
				this.$router.push({
					path: name,
					query: {
						tag_id: this.currentTagId
					}
				})
			},
			changeTagType(name) {
				this.action = 'list'
				this.search_value = ''
				this.tagType = name;
				this.initTagData();
			},
			initTagData() {
				this.$http.get('tags',{
					params: {
						tag_type: this.tagType,
						bid:this.bid$
					}
				})
				.then(res => {
					let list = res.body.data.list;
					this.tagList = list;
				},res => {
					this.$Message.error(res.body.message);
				})
			},
			addTag() {
				if(this.addTagData.name == '') {
					this.$Message.error('标签名不能为空');
					return
				}
				this.$http.post('tag_relations',{
					tag_type: this.type,
					relate_id: this.id,
					tag_name: this.addTagData.name,
					color: this.addTagData.color,
					is_private: this.addTagData.isPrivate,
					bid:this.bid$
				})
				.then(res => {
					this.$Message.success('添加标签成功');
					this.addMode = false;
					this.initData();
					this.$emit('update');
				},res => {
					this.error(res.body.message);
				})
			},
			changeAddMode() {
				this.addMode = !this.addMode;
			},
			deleteTag(event, id) {
				let cItem = this.tagList.find(item => {
					return item.tag_id == id
				})
				this.$Modal.confirm({
					content: `确认要删除 ${cItem.total} 个${this.name_map[this.tagType-1]}的标签【${cItem.tag_name}】`,
					onOk: ()=> {
						this.$http.post('tags/delete_relation', {
							tag_id: id,
							tag_type: this.tagType
						})
						.then(res => {
							this.$Message.success('删除标签成功');
							this.currentTagId = 0
							this.initTagData();
							this.deleteCallback(id)
						},res => {
							this.error(res.body.message);
						})
					}
				})
			},
			deleteCallback(id) {
				let tagPaths = Object.values(this.path_map)
				let currentPath = this.$route.path
				let index = tagPaths.indexOf(currentPath)
				if(index > -1) {
					this.$router.replace(currentPath)
				}
			},
			throttle(method,context) {
				clearTimeout(method.tId);
	            method.tId = setTimeout(function(){
	                method.call(context)
	            },500)
			},
			getDataByKey() {
				let key = this.search_key
				this.loading = true
				this.data = []
				if(this.is_tel) {
					this.getStudentByTel(this.data,key)
				}else{
					if(this.tagType == 1) {
						this.routes.forEach(r => {
							if(r.text.indexOf(
								key) !==-1 
								|| r.py1.toLowerCase().indexOf(key) !== -1 
								|| r.py2.indexOf(key) !== -1
							) 
							{
								this.data.push(r)
							}
						})
						this.getStudentByName(this.data,key)
					}
					else if(this.tagType == 2) {
						this.getClassByName(this.data,key)
					}
					else {
						this.getCustomerByName(this.data,key)
					}
					
				}
			},
			getStudentByTel(data,key) {
				this.$rest('students').add_url_param('get_info_by_tel')
				.get({
					tel: key
				})
				.success(res => {
					let ret = []
					res.forEach(item => {
						item.detail.forEach(d => {
							d.type = item.type
							ret.push(d)
						})
					})
					this.tel_relate = ret
					this.loading = false
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			getCustomerByName(data,key) {
				this.$rest('customers')
				.get({
					name:key,
					pagesize: 100
				})
				.success(res => {
					for(let i=0,len=res.list.length;i<len;i++) {
						let item = res.list[i],obj = {}

						obj.text = item.name
						obj.cu_id = item.cu_id
						obj.type = 'customer'
						obj.index = i
						data.push(obj)
					}
					this.loading = false
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			getClassByName(data,key) {
				this.$rest('classes')
				.get({
					class_name:key,
					pagesize: 100
				})
				.success(res => {
					for(let i=0,len=res.list.length;i<len;i++) {
						let item = res.list[i],obj = {}

						obj.text = item.class_name
						obj.cid = item.cid
						obj.type = 'class'
						obj.index = i
						data.push(obj)
					}
					this.loading = false
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			getStudentByName(data,key) {
				this.$rest('students')
				.get({
					search_field: 'student_name',
					search_value: key,
					pagesize:50,
					bid:this.bid$
				})
				.success(res => {
					for(let i=0,len=res.list.length;i<len;i++) {
						let item = res.list[i],obj = {}

						obj.text = item.student_name
						obj.sid = item.sid
						obj.type = 'student'
						obj.index = i
						data.push(obj)
					}
					this.loading = false
				})
				.error(res => {
					this.$Message.error(res.body.message)
				})
			},
			loopPush(nav,data) {
				if(nav.sub&&nav.sub.length > 0) {
					let parent = ''
						parent = nav.uri.split('.')[0]
					nav.sub.forEach(child => {
						let obj = {
							text:child.text,
							py1:pinyin.getFullChars(child.text),
							py2:pinyin.getFirstFull(child.text),
							data:child.uri,
							type:'route',
							parent:parent
						}
						if(obj.text == '概览') {
							obj.text = nav.text + obj.text
						}
						if(child.sub&&child.sub.length>0) {
							this.loopPush(child,data)
						}else{
							data.push(obj)
						}
					})
				}
			},
			clickItem(item) {
				let type = item.type
				if(type == 'student') {
					this.$Modal.open('common/modal/student-box.vue@modal',{
						props: {
							sid: item.sid
						}
					})
					.then(modal=>{
						modal
						.show('学员信息','detail')
					})
				}else if(type == 'route') {
					this.$router.push(this.$filter('uri')(item))
				}
				else if(type == 'customer') {
					this.$router.push(`/recruiting/list/${item.cu_id}/following`)
				}
				else if(type == 'class') {
					this.$router.push(`/business/class/${item.cid}`)
				}
			},
			rightIcon(item) {
				let type = item.type
				if(type == 'student' || type == 'customer') {
					return 'android-person'
				}else if(type == 'route') {
					return 'cube'
				}else{
					return 'ios-home'
				}
			},
			showTelInfo() {
				this.$Modal.open('common/modal/same-tel-list.vue@modal',{
					props: {
						data: this.tel_relate
					}
				})
				.then(modal => {
					modal.show(util.sprintf('号码为%s的名单',this.search_key))
				})
			},
			toggleTagPanel(){
				if(this.search_key == ''){
					for(let k in this.path_map) {
						if(this.path_map[k] == this.$route.path) {
							this.tagType = Number(k)
							break;
						}
					}
					this.showTagPanel = true
					this.$nextTick(() => {
						this.$refs.tag_menu.updateActiveName()
					})
				}
			}
		},
		watch: {
			'search_key': function(key) {
				if(key!=='') {
					this.throttle(this.getDataByKey,window)
					this.showTagPanel = false
				}else{
					this.data.splice(0)
					this.showTagPanel = true
				}
			},
			showTagPanel(val) {
				if(val) {
					this.initTagData();
				}
			},
		}
	}
</script>
<style lang="less">
	.navbar-search {
		.navbar-search-dropdown {
			width: 200px;
		    transform-origin: center top 0px;
		    .ivu-dropdown-item {
		    	color: #3399ff;
		    	&.not-found {
		    		color: #bbbec4;
		    	}
		    	i {
		    		margin-right: 5px;
		    	}
		    }
		}
		.ivu-select-dropdown {
			overflow: auto;
			max-height: 400px;
		}
	}
</style>