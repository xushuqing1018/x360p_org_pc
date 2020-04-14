<template>
    <div class="c-grid">
    	<div class="box box-query">
            <Row class="basic">
                <Col span="6">
                    <Input class="input-search" size="small" v-model="params.search_value" v-focusme="'searchkey'">                        
						<span slot="prepend">科目名称</span>                        
                        <Button-group class="input-search-append" slot="append" style="width: 25px;">
                            <Button class="btn-search" icon="ios-search" v-tooltip="'查询'" @click="search"></Button>
                        </Button-group>
                    </Input>
                </Col>
                <Col span="2">
                    <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                </Col>
                <Col span="16">
                </Col>
            </Row>
        </div>
        <div class="box box-result">
            <div class="toolbar">
            	<Button type="primary" @click="add" icon="plus" v-per="'subject.add'">添加新科目</Button>                
            	<import-button res="subjects" name="科目" @on-import-finish="init_data" v-per="'subject.add'"></import-button>
                <div class="filter-column">
                    <filter-column :keys="column_keys"></filter-column>
                </div>
            </div>
            <div class="content">
                <div class="content-body">
                    <Table 
                    v-loading="'subjects'" 
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
        <subject-info-modal ref="infoModal" @save="init_data"></subject-info-modal>
        <subject-grade ref="ref_grade"></subject-grade>
    </div>
</template>
<script>
	import util from '@/libs/util'
    import grid from '@/libs/grid.mixin'
    import directive from '@/libs/directive.mixin'
    import globals from '@/libs/globals.mixin'
    import common from '@/libs/common.mixin'
    import subjectInfoModal from './subject/info-modal.vue'
    import subjectGrade from './subject/grade-manage.vue'
    import ImportButton from 'c%/ImportButton.vue'
    
    export default {
    	mixins:[common,directive,grid,globals],
        components:{
        	subjectGrade,
        	ImportButton,
            subjectInfoModal,
        },
    	data() {
    		return {
    			rest_api: 'subjects',
    			res_name:'科目',
                pk:'sj_id',
                datakey:'subject',
                params: {
                	search_field: 'subject_name',
                	search_value: ''
                },
    			column_keys: {
    				subject_name: {
    					title: "科目名称",
    					sortable:'custom',
                        show:true
    				},
    				short_desc: {
    					title: '科目描述',
    					sortable:'custom',
                        show:true
    				},
                    pj_id:{
                        title: '所属项目',
                        show:true
                    }
                    /*
    				unit_price: {
    					title: '课时单价',
    					show: true
    				},
                    per_lesson_hour_minutes:{
                        title:'单课时分钟',
                        show:true
                    }*/
    			},
                operation_keys: {
                    edit: {
                        title: '编辑',
                        type: 'edit',
                        per: 'subject.edit'
                    },
                    delete: {
                        title: '删除',
                        type: 'ios-trash',
                        per: 'subject.delete'
                    },
                    gradeManage: {
                        title: '级别管理',
                        type: 'levels',
                        per: 'subject.grademanage'
                    }
                },
                operation_func: {
                    edit (params) {                     
                        this.edit(params.row)
                    },
                    delete (params) {                       
                        this.confirm('您确定要删除科目【'+params.row.subject_name+'】吗?')
                        .then(()=>{
                            this.delete(params.row)
                        })
                        .catch(() => {
                            
                        })
                    },
                    gradeManage (params) {
                        this.$r('ref_grade')
                        .set('sj_id',params.row.sj_id)
                        .init_data()
                        .show(util.sprintf('级别管理【%s】',params.row.subject_name))
                    }
                },
                column_render: {
                    unit_price(h, params) {
                        let s = params.row.unit_price
                       if( params.row.unit_price == 0 ){
                            s = '未设置'
                       }
                       return h('span',s)

                    },
                    per_lesson_hour_minutes(h,params){
                        let s = params.row.per_lesson_hour_minutes
                        if(s == 0){
                            s = '未设置'
                        }
                        return h('span',s)
                    }
                }

    		}
    	},
    	methods: {
            add(){
                this.$r('infoModal')
                .show('添加新科目')
            },
            edit(row){
                this.$r('infoModal')
                .set('info',row)
                .show(util.sprintf('编辑科目:%s',row.subject_name),'edit')
            },
            search () {
            	this.params.search_field = 'subject_name'
            	this.pagenation(1)
            }
    	},
        created(){
            if(!this.enable_project){
                delete this.colum_keys['pj_id']
            }
        },
    	mounted() {
    		this.init_data()
    	},
    	computed: {

    	}
    }
</script>