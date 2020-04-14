<template>
    <div class="c-grid">
    	<div class="box box-query">
            <Row class="basic">
                <Col span="6">
                    <Input class="input-search" size="small" v-model="search_field.school_name" v-focusme="'searchkey'">
                        <span slot="prepend">学校名称</span>
                        <Button-group class="input-search-append" slot="append" style="width: 25px;">
                            <Button class="btn-search" icon="ios-search" v-tooltip="'查询'" @click="search"></Button>
                        </Button-group>
                    </Input>
                </Col>
                <Col span="2">
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                </Col>
                <Col span="16"></Col>
            </Row>
        </div>
        <div class="box box-result">
            <div class="toolbar">
                <Button type="primary" @click="addInfo" icon="plus" v-per="'schools.add'">添加</Button>
                <!--<Button type="primary" icon="android-download" @click="importInfo">从云端导入</Button>-->
                <div class="filter-column">
                    <Dropdown placement="bottom-end">
                        <Button type="primary">
                          	 选择列
                            <Icon type="funnel"></Icon>
                        </Button>
                        <Dropdown-menu slot="list">
                            <Dropdown-item v-for="item in column_keys">
                                <Checkbox v-model="item.show">{{item.title}}</Checkbox>
                            </Dropdown-item>
                        </Dropdown-menu>
                    </Dropdown>
                </div>
            </div>
            <div class="content">
                <div class="content-body">
                    <Table 
                    v-loading="'public_schools'" 
                    :pageSize="pageSize" 
                    :page="pageIndex" 
                    :stripe="true" 
                    :show-header="true" 
                    :data="data" 
                    :columns="columns" 
                    :no-data-text="$store.state.config.EMPTY_DATA_TEXT" 
                    :no-filtered-data-text="$store.state.config.EMPTY_FILTER_DATA_TEXT" 
                    @on-sort-change="sortChange"
                    > 
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
                        @on-page-size-change="pagesize"
                        >
                        </Page>
                    </div>
                </div>
            </div>
        </div>
        <info-modal @on-success="init_data" ref="infoModal"></info-modal>
        <import-school @on-success="init_data" ref="import"></import-school>
    </div>
</template>
<script>
	import util from '@/libs/util'
    import grid from '@/libs/grid.mixin'
    import directive from '@/libs/directive.mixin'
    import globals from '@/libs/globals.mixin'
    import common from '@/libs/common.mixin'
    import infoModal from './school/info-modal.vue'
    import importSchool from './school/import.vue'
    import selectSchool from './school/select-school.vue'
    
    export default {
    	mixins:[common,directive,grid,globals],
        components:{
            infoModal,
            importSchool,
            selectSchool
        },
    	data() {
    		return {
    			rest_api: 'public_schools',
    			res_name:'学校',
                pk:'ps_id',
                search_field: {
                    school_name: ''
                },
    			column_keys: {
    				school_name: {
    					title: "学校名称",
    					sortable:'custom',
                        show:true
    				},
    				address: {
    					title: '详细地址',
    					sortable:'custom',
                        show:true
    				}
    			},
                operation_keys: {
                    edit: {
                        title: '编辑',
                        type: 'edit',
                        per: 'schools.edit'
                    },
                    delete: {
                        title: '删除',
                        type: 'ios-trash',
                        per: 'schools.delete'
                    }
                },
                operation_func: {
                    edit (params) {                     
                        this.edit(params.row)
                    },
                    delete (params) {                       
                        this.confirm('您确定要删除学校【'+params.row.school_name+'】吗?')
                        .then(()=>{
                            this.delete(params.row).then((response) => {
                                this.$Message.success('删除成功')
                            })
                        })
                    }
                }

    		}
    	},
    	mounted () {
    		this.init_data()
    	},
    	methods: {
    		importInfo () {
    			this.$r('import')
                .show('导入公立学校','add')
    		},
            addInfo(){
                this.$r('infoModal')
                .show('添加公立学校')
            },
            edit(row){
                this.$r('infoModal')
                .set('info',row)
                .show(util.sprintf('编辑校区:%s',row.school_name),'edit')
            },
            hook_get_param(params){
                let search_obj = util.copy(this.search_field)
                for(let o in search_obj) {
                    let property = search_obj[o]
                    if(property&&property!='-1'){
                        params[o] = property
                    } 
                }
            },
    	}
    }
</script>