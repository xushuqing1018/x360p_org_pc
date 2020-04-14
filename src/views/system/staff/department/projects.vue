<style lang="less">
.import-wrap{
    padding:15px;
    margin-top:10px;
    background:#f2f2f2;
    border-radius:5px;
}
.short_name{
    color:#999;
    padding-top: 2px;
}
</style>
<template>
	<div>
        <div class="box box-query">
            <dept-type-switch @on-change="deptTypeChange" :dept-type="dept_type"></dept-type-switch>
        </div>
        <div class="box box-query">
            <Row class="basic">
                <Col span="10">
                    <Input class="input-search" size="small" v-model="params.search_value" v-focusme="'searchkey'">
                        <Select v-model="params.search_field" slot="prepend" style="width: 80px;">
                            <Option value="pj_name">项目名称</Option>
                        </Select>
                        <Button-group class="input-search-append" slot="append" style="width: 25px;">
                            <Button class="btn-search" icon="ios-search" v-tooltip="'查询'" @click="search"></Button>
                        </Button-group>
                    </Input>
                </Col>
                <Col span="2">
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                </Col>
                <Col span="12">
                </Col>
            </Row>
        </div>
        <div class="box box-result">
            <div class="toolbar">
                <Button type="primary" icon="plus" v-per="'projects.add'" @click="addInfo">添加项目</Button>
                <filter-column :keys="column_keys"></filter-column>
            </div>
            <div class="content">
                <div class="content-body">
                    <Table 
                        v-loading.like="'projects'" 
                        :pageSize="pageSize" 
                        :page="pageIndex" 
                        :stripe="true" 
                        :show-header="true" 
                        :data="data" 
                        :columns="columns" 
                        :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
                        :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
                        @on-sort-change="sortChange"> 
                    </Table>
                </div>
                <div class="content-footer">
                    <div class="pagenation">
                        <Page 
                            :total="total" 
                            :current="pageIndex" 
                            :show-sizer="true" 
                            :page-size="pageSize" 
                            :show-total="true" 
                            @on-change="pagenation" 
                            @on-page-size-change="pagesize">
                        </Page>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import util from '@/libs/util'
    import grid from '@/libs/grid.mixin'
    import directive from '@/libs/directive.mixin'
    import globals from '@/libs/globals.mixin'
    import common from '@/libs/common.mixin'
    import ImportButton from 'c%/ImportButton.vue'
    import InfoBranchModal from './info-branch-modal'
    import deptTypeSwitch from './dept-type-switch.vue'

    export default {
        mixins:[common,directive,grid,globals],
        components:{
            ImportButton,
            InfoBranchModal,
            deptTypeSwitch
        },
        data () {
            return {
                modal:{
                    upload:false
                },
                dept_type: "projects",                     
                rest_api:'projects',                  //资源API
                res_name:'项目',                      //资源名称
                pk:'pj_id',                      	  //主键ID
                column_keys: {
                  pj_name: {   
                      title: '项目名称',
                      show: true,
                  },
                  charge_eid:{
                      title: '负责人',
                      show:true
                  },
                  operation: {    
                      title: '操作',
                      width: 150,
                      show: true               
                  }
                },              
                column_render: {
                  pj_name(h, params) {
                    return h('h5', params.row.pj_name)
                  },
                  charge_eid(h,params){
                      return h('span',this.$filter('ename')(params.row.charge_eid,'-'))
                  },
                  operation(h, params) {
                    let edit = h('Button',{
                        props: {
                                type: 'ghost',
                                shape: 'circle',
                                size: 'small',
                                icon: 'edit',
                                vPer: 'projects.edit'
                            },
                        on: {
                            click: ()=>{
                                this.$Modal.open('system/staff/department/info-project-modal.vue',{
				            	on: {
				            		'on-success': () => {
                                        this.init_data()
                                        this.$store.dispatch('updateGlobalVar','projects')
				            		}
				            	}
                            })
				            .then(modal => {
                                modal
                                  .set('info', params.row)
                                  .show('编辑项目', 'edit')
				            })
                            }
                        }
                    })
					let del =  h('Button',{
							props: {
                                type: 'ghost',
                                shape: 'circle',
                                size: 'small',
                                icon: 'ios-trash',
                                vPer: 'projects.delete'
                            },
                            on: {
                                click: ()=>{
                                    this.$rest("projects")
                                    .delete(params.row.pj_id)
                                    .success((response)=>{
                                      this.init_data()
                                      this.$Message.success('删除成功')
                                    })
                                    .error((response)=>{
                                      this.error(response.body.message)
                                    })
                                }
                            }
						})
					return h('div',[edit,' ',del])
                  }
              }
            }
        },
        methods:{
            deptTypeChange (val) {
                this.dept_type = val
            },
            addInfo () {
                this.$Modal.open('system/staff/department/info-project-modal.vue',{
					on: {
						'on-success': () => {
							this.init_data();
						}
					}
                })
				.then(modal => {
					modal.show('添加项目', 'add')
				})                
            }
        },
        mounted(){
            this.init_data()
            this.params.search_field = 'pj_name'
        },
        watch: {
          "dept_type": function (val) {
            if(val == "branchs") {
              this.dept_type = "branchs"
              this.$emit("on-change", val)
            }
          }
        }
    }
</script>
