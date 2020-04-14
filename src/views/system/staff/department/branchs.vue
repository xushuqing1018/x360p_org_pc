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
        <div class="box box-query" v-if="enable_project">
            <dept-type-switch @on-change="deptTypeChange" :dept-type="dept_type"></dept-type-switch>
        </div>
        <div class="box box-query">
            <Row class="basic">
                <Col span="10">
                    <Input class="input-search" size="small" v-model="params.search_value" v-focusme="'searchkey'">
                        <Select v-model="params.search_field" slot="prepend" style="width: 80px;">
                            <Option value="branch_name">校区名称</Option>
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
                <filter-column :keys="column_keys"></filter-column>
            </div>
            <div class="content">
                <div class="content-body">
                    <Table 
                        v-loading.like="'branches'" 
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
        <info-branch-modal ref="InfoModal" @save="init_data"></info-branch-modal>
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
                dept_type: 'branchs',              
                rest_api:'branches',                  //资源API
                res_name:'校区',                      //资源名称
                pk:'bid',                       	  //主键ID
                column_keys: {
                    branch: {
                        title: '校区',
                        show: true
                    },
                    branch_name: {
                        title:'校区名称',
                        show:false
                    },
                    short_name: {
                        title:'校区简称',
                        show:false
                    },
                    bill_prefix:{
                        title: '校区编号',
                        show:false
                    },
                    branch_type: {
                        title:'校区类型',
                        show:true
                    },
                    branch_tel: {
                        title:'校区电话',
                        show:true
                    },
                    address: {
                        title:'校区地址',
                        show:true
                    }
                },               
                operation_btn: {
                    operation(h, params) {
                        return h('Button',{
                            props: {
                                type: 'ghost',
                                shape: 'circle',
                                size: 'small',
                                icon: 'edit',
                                vPer: 'branches.edit'
                            },
                            on: {
                                click: ()=>{
                                    this.$refs['InfoModal'].set('info',params.row)
                                    .show(util.sprintf('编辑%s',params.row.branch_name),'edit')
                                }
                            }
                        })
                    }
                },
                column_render: {
                    branch(h, params) {
                        let c = []
                        c.push(h('h5', params.row.branch_name))
                        c.push(h('p',{attrs:{class:'short_name'}},util.sprintf('简称:%s',params.row.short_name)))
                        return h('div',{attrs:{class:"name-cls"}},c)
                    },
                    branch_type(h, params) {
                        let map = {1:'直营',2:'加盟'}
                        return h('span',map[params.row.branch_type])
                    },
                    branch_tel(h, params) {
                        return h('span',params.row.branch_tel || '-')
                    },
                    address(h,params) {
                        let row = params.row
                        if(!params.row.province_id) {
                            return h('span','-')
                        }else{
                            let ssq = this.ssqFormat(row.province_id,row.city_id,row.district_id)
                            return h('span',ssq+row.address)
                        }
                        

                    }
                }
            }
        },
        methods:{
            deptTypeChange(val) {
                this.dept_type = val
            }
        },
        mounted(){
            this.init_data()
            this.params.search_field = 'branch_name'
        },
        watch: {
          "dept_type": function(val) {
            if(val == "projects") {
              this.dept_type = "projects"
              this.$emit("on-change", val)
            }
          }
        }
    }
</script>
