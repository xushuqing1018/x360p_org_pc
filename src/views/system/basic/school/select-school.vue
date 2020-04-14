<style lang="less">
	.x-select-school{
		display: table;
		.ivu-auto-complete{
			display: table-cell;
			.ivu-input{			
				border-radius: 4px 0 0 4px !important;			
			}
		}		
		.ivu-btn{
			float: left;
			display: table-cell;
			border-radius: 0 4px 4px 0 !important;
			padding: 6px 15px !important;
			margin-left: -1px;
			background-color: #eee;
			&:hover{
				color: #657180;
				border-color: #dfe4e9!important;
			}
		}
	}
</style>

<template>
	<div class="x-select-school">
		<AutoComplete v-model="school_name" clearable placeholder="请输入校区名称">
			<Option v-for="item in public_schools" :key="item.ps_id" :value="item.school_name" @click.native="searchSelect(item)">
		    	<span class="demo-auto-complete-title">{{item.school_name}}</span>
		   </Option>
			
		</AutoComplete>
		<info-modal ref="info"></info-modal>
		<Button v-per="'schools.add'" slot="append" icon="plus" title="添加公立学校" @click="addInfo"></Button>
	</div>
</template>

<script>
	import infoModal from './info-modal.vue'	
	
	export default{
		components: {
			infoModal
		},
		props: {
			
		},
		data () {
			return {
				school_name:''
			}
		},
		methods: {
			addInfo () {
				this.$refs['info']
				.show('添加公立学校','add')
			},
			searchSelect (row){
				this.$emit('on-select',row)
			},
			resetSchoolName () {
				this.school_name = ''
			}
		},
		computed: {
			public_schools () {
				let school_name = this.school_name,
					public_schools = this.$store.state.gvars.public_schools
					
				if(!/$\s*^/.test(school_name)){
					return public_schools.filter(s=>s.school_name.indexOf(school_name)>-1)
				}
				return public_schools
			}
		},
		watch: {
			'school_name': function(val) {
				if(val === '') {
					this.$emit('on-clear')
				}
			}
		}
	}
</script>
