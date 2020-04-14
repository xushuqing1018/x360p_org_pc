<template>
	<ul class="x-material-tree">
		<li class="x-li cursor"
		:id="item.mt_id"
		:class="{'x-li-last':isLast}"
		@click.stop="setCurrentItem(item)"
		>
			<div class="x-li-node" :class="currentItem.mt_id===item.mt_id?'text-primary':''" :title="item.name">								
				<i class="tree-icon tree-ocl" v-if="item.parent_id>0"></i>
				<Icon type="document" v-if="item.is_cate==0"></Icon>
				<Icon 
					:type="item.expanded||item.children_num==0?'android-folder-open':'android-folder'" 
					@click.native.stop="item.expanded=!item.expanded" 
					v-else>
				</Icon>
				<!--<Icon type="record" :color="currentItem.mt_id===item.mt_id?'#2d8cf0':'transparent'"></Icon>-->
				{{item.name}}
				({{item.num}})
				<div class="x-li-node-btn">			
					<Button 
						@click.stop="delInfo(item)" 
						class="pull-right ml-1" 
						type="text" 
						v-per="'materials.delete'"
						:disabled="item.children_num>0"
						size="small" 
						icon="trash-a" 
						title="移除">
					</Button>
					<Button 
						@click.stop="editInfo(item)" 
						class="pull-right ml-1" 
						type="text" 
						v-per="'materials.edit'"
						size="small" 
						icon="edit" 
						title="编辑">
					</Button>
					<Button 
						@click.stop="addInfo(item)" 
						class="pull-right" 
						type="text" 
						v-per="'materials.add'"
						:disabled="item.is_cate==0||item.level>2"
						size="small" 
						icon="plus" 
						title="添加">
					</Button>
				</div>
			</div>
			
			<template v-if="item.children_num>0">				
				<tree-node 
					:item="node" 
					:index="ii"
					:total="item.children.length"
					v-for="(node,ii) in item.children" 
					v-show="item.expanded"
					:current-item="currentItem"
					@add="addInfo"
					@edit="editInfo"
					@del="delInfo"
					@set-current-item="setCurrentItem">
				</tree-node>
			</template>
		</li>
	</ul>
</template>

<script>
	import util,{_} from '@/libs/util'
	
	export default{
		name: 'TreeNode',
		props: {
			item: {
				type: Object,
				default: ()=>{
					return {}
				}
			},
			total:{
				type:Number
			},
			index:{
				type:Number
			},
			currentItem: {
				type: Object,
				default: ()=>{
					return {}
				}
			}
		},
		computed:{
			isLast(){
				return this.index+1 == this.total
			}
		},
		data () {
			return {
			}
		},
		methods: {
			setCurrentItem (item) {
				if(item.children_num==0&&item.is_cate==0){
					this.$emit('set-current-item',item)					
				}
			},
			addInfo (item) {
				this.$emit('add',item)
			},
			editInfo (item) {
				this.$emit('edit',item)
			},
			delInfo (item) {
				this.$emit('del',item)
			}
		}
	}
</script>

<style lang="less" scoped>
.tree-icon.tree-ocl{
	background-image: url("/src/style/xtree/32px.png");
	background-position: -68px -4px;
    width: 24px;
    height: 24px;
    line-height: 24px;
    position:absolute;
    top:-4px;
    left:0;
}
.overflow-auto{
	overflow: auto;
}
.x-material-tree > li ul{
	padding-left: 18px;
	width: 100%;
}
ul li{
	list-style: none;
    margin: 0;
    padding: 0;
    white-space: nowrap;
    outline: 0;
}
.x-li-node{
	position:relative;
}
.x-material-tree >li ul li.x-li{
	background-image: url("/src/style/xtree/32px.png");
	background-position: -292px -4px;
    background-repeat: repeat-y;
	.x-li-node{
		padding-left:24px;
	}
}
.x-li-last{
	background:transparent !important;
}

.x-li-node-btn{
	width:94px;
	position:absolute;
	right:0;
	top:3px;
	.ivu-btn-small{
		padding:2px 3px;
	}
}
</style>