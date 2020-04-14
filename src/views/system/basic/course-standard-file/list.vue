<style scoped>
    div.content {
		margin-bottom: 10px!important;
	}
	div.content-footer {
		overflow: hidden!important;
	}
	div.pagenation {
		float: right!important;
	}
</style>
<template>
    <div class="c-grid">
        <div class="box box-query">
            <Form :label-width="80" ref="form" :model="search_field" class="filter-form row">
            	<Form-item label="标题" prop="student_name" class="col-md-3 col-sm-6">
					<Input v-model="search_field.title" placeholder="请输入标题" @keyup.native.enter="init_data"></Input>
				</Form-item>
                <Form-item label="选择课程" prop="lid" class="col-md-3 col-sm-6">
                    <select-lesson v-model="search_field.lid"></select-lesson>
                </Form-item>
                <Form-item label="选择教材" prop="tb_id" class="col-md-3 col-sm-6">
                    <select-textbook v-model="search_field.tb_id"></select-textbook>
                </Form-item>
                <Form-item label="课标类型" prop="csft_did" class="col-md-3 col-sm-6">
                    <Select v-model="search_field.csft_did">
                        <Option :value="0">不限</Option>
                        <Option 
                        :value="item.did" 
                        v-for="item in dicts('course_standard_file_type')"
                        :key="item.did">{{item.title}}</Option>
                    </Select>
                </Form-item>
                <Form-item label="章节序号" prop="chapter_index" class="col-md-3 col-sm-6" v-if="search_field.lid">
                    <Input v-model="search_field.chapter_index"></Input>
                </Form-item>
                <Form-item label="章节" prop="chapter_index" class="col-md-3 col-sm-6" v-if="search_field.tb_id">
                    <Select v-model="search_field.tbs_id">
                        <Option :value="item.tbs_id" v-for="item in sectionData" :key="item.tbs_id">第{{item.sort}}章：{{item.section_title}}</Option>
                    </Select>
                </Form-item>
            </Form>
            <Row class="basic">
                <Col span="24">
                <Button type="primary" icon="ios-search" @click="search">查询</Button>
                <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
                <CheckboxGroup v-model="search_field.enable" class="ml-3" style="display: inline-block;">
                    <Checkbox :label="1">
                        <span>启用中</span>
                    </Checkbox>
                    <Checkbox :label="0">
                        <span>已禁用</span>
                    </Checkbox>
                </CheckboxGroup>
                <div class="pull-right" v-if="is_orgs">
                    <label>范围：</label>
                    <ButtonGroup>
                        <Button :type="type_value=='local'?'primary':'ghost'" size="small" icon="android-person" @click="type_value='local'">课标
                        </Button>
                        <Button :type="type_value=='center'?'primary':'ghost'" size="small" icon="android-people" @click="type_value='center'">总部课标
                        </Button>
                    </ButtonGroup>
                </div>
                </Col>
            </Row>
        </div>
        <div class="box box-result">
            <div class="toolbar">
                <Button type="primary" @click="addInfo" icon="plus" v-per="'course_standard_file.add'" :disabled="is_orgs&&type_value=='center'">添加</Button>
                <import-button res="lesson_standard_files" name="课标" @on-import-finish="init_data" v-if="!(is_orgs&&type_value=='center')"></import-button>
                <Dropdown trigger="click" v-if="!(is_orgs&&type_value=='center')">
                    <Tooltip content="点击选择框进入选择模式" placement="top" v-if="selectedList.length==0">
                        <Button type="ghost" icon="ios-gear-outline" disabled>批量操作</Button>
                    </Tooltip>
                    <Button v-else type="ghost" icon="ios-gear-outline">批量操作</Button>
                    <DropdownMenu slot="list">
                        <DropdownItem @click.native.stop="multiDel">
                            <Icon type="ios-trash"></Icon> 删除
                        </DropdownItem>
                        <DropdownItem @click.native.stop="multiDisable(1)">
                            <Icon type="ios-checkmark"></Icon> 启用
                        </DropdownItem>
                        <DropdownItem @click.native.stop="multiDisable(0)">
                            <Icon type="minus-circled"></Icon> 禁用
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
                <Checkbox v-if="!(is_orgs&&type_value=='center')" style="margin-left:10px" v-model="checkAll" @on-change="changeAllCheck">全选</Checkbox>
                <Button type="ghost" style="margin-left: 10px" @click="textbook_view" icon="ios-list-outline" v-per="'course_standard_file.add'">教材管理</Button>
                <RadioGroup 
                v-model="type" 
                type="button" 
                class="pull-right"
                @on-change="changeType" size="small">
                    <Radio label="list"><Icon type="ios-list-outline"></Icon>列表</Radio>
                    <Radio label="view"><Icon type="ios-grid-view"></Icon>视图</Radio>
                </RadioGroup>
            </div>
        </div>
        <div class="content">
            <div class="content-body">
            	<div class="text-center" v-if="loading">正在加载数据...</div>
            	<template v-else>
            		<div class="empty" v-if="csList.length == 0"><p>无数据...</p></div>
	                <csf-list :list="csList" @changeCheckFromView="changeCheckFromView" :checkMode="checkMode" @onchange="changeCheck" @opClick="opClick" :typevalue="type_value" :type="callType">
	                </csf-list>
	            </template>
            </div>
            <div class="content-footer">
                <div class="pagenation">
                    <Page :total="total" :current="pageIndex" :page-size="pageSize" :show-total="true" @on-change="pagenation" @on-page-size-change="pagesize">
                    </Page>
                </div>
            </div> 
        </div>
        <info-modal ref="info" @on-success="init_data"></info-modal>
    </div>
</template>
<script>
import util from '@/libs/util'
import grid from '@/libs/grid.mixin'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
import SelectLesson from 'c%/SelectLesson.vue'
import SelectTextbook from 'c%/SelectTextbook.vue'
import ImportButton from 'c%/ImportButton.vue'
import InfoModal from './info-modal.vue'
import CsfList from 'c%/CsfList.vue'

const ENABLE_OPERATION_KEYS = {
    edit: {
        title: '编辑',
        type: 'edit',
        per: 'course_standard_file.edit'
    },
    del: {
        title: '删除',
        type: 'ios-trash',
        per: 'course_standard_file.delete'
    }
}
const DISABLE_OPERATION_KEYS = {}
export default {
    mixins: [grid, common, globals],
    components: {
        InfoModal,
        ImportButton,
        SelectLesson,
        SelectTextbook,
        CsfList
    },
    data() {
        return {
            callType: 'select',
            type: 'list',
            checkMode: false,
            checkAll: false,
            rest_api: 'lesson_standard_files',
            pk: 'lsf_id',
            type_value: 'local',
            currentFile: {},
            selectedList: [],
            showCheckbox: true,
            search_field: {
                lid: 0,
                csft_did: 0,
                enable: [0, 1],
                chapter_index: '',
                tb_id: 0,
                tbs_id: 0,
                title:''
            },
            csList: [],
            sectionData: []
        }
    },
    watch: {
        type_value: function(val) {
            if (val == 'center') {
                this.getCenterLessons()
                this.operation_keys = DISABLE_OPERATION_KEYS
                this.showCheckbox = false
                this.selectedList.splice(0)
            } else {
                this.operation_keys = ENABLE_OPERATION_KEYS
                this.showCheckbox = true
            }
            this.init_data()
        },
        checkMode: function(val) {
            if (val) {
                this.$Message.info('已进入选择模式');
            } else {
                this.$Message.info('已退出选择模式');
            }
        },
        'search_field.tb_id': 'getTextbookSection'
    },
    mounted() {
        let type = this.$route.query.type;
        if (type == 'center' || this.is_orgs) {
            this.type_value = 'center'
            this.getCenterLessons()
            this.operation_keys = DISABLE_OPERATION_KEYS
            this.showCheckbox = false
            this.selectedList.splice(0)
        }
        this.init_data()
    },
    methods: {
        // pptFileManage() {
        // 	this.$Modal.open('system/basic/course-standard-file/ppt-file-modal.vue@modal')
        // 	.then(modal=>{
        // 		modal.show('PPT附件管理')
        // 	})
        // },
        getTextbookSection() {
            this.$http.get('textbook_sections', {
                    params: {
                        tb_id: this.search_field.tb_id,
                        pagesize: 100
                    }
                })
                .then(res => {
                    var list = res.body.data.list;
                    list.sort((a, b) => {
                        return a.sort - b.sort
                    })
                    this.sectionData = list;
                }, res => {
                    this.$Message.error(res.body.message)
                })
        },
        changeType() {
            this.$emit('changeType')
        },
        editSort(index) {
            this.csList[index].$edit = true;
        },
        editSortOk(index) {
            this.sortItem(this.csList[index])
        },
        changeCheck(index) {
            this.changeCheckStatus();
        },
        changeAllCheck(val) {
            if (val) {
                this.csList.forEach(item => {
                    item.$check = true;
                })
                this.checkMode = true
            } else {
                this.csList.forEach(item => {
                    item.$check = false;
                })
                this.checkMode = false
            }
        },
        changeCheckFromView(item, index) {
            if (this.checkMode) {
                this.csList[index].$check = !this.csList[index].$check;
                this.changeCheckStatus();
            }
        },
        changeCheckStatus() {
            var filterList = this.csList.filter(item => {
                return item.$check;
            })
            this.selectedList = filterList;
            if (filterList.length == this.csList.length) {
                this.checkAll = true;
            } else {
                this.checkAll = false;
            }
            if (filterList.length == 0) {
                this.checkMode = false;
            } else {
                this.checkMode = true;
            }
        },
        getCenterLessons() {
            this.dr().getData('lessons?pagesize=10000&og_id=0&bids=-1')
                .then(data => {
                    if (data.list.length > 0) {
                        this.updateGvarsLessons(data.list)
                    }
                }, response => {
                    this.$Notice.warning({
                        title: '提示',
                        desc: response.body.message || '获取总部课标失败~'
                    })
                })
        },
        updateGvarsLessons(list) {
            let lessons = this.gvars('lessons')

            if (list.length > 0) {
                list.forEach(l => {
                    if (lessons.findIndex(lesson => lesson.lid == l.lid) == -1) {
                        lessons.push(l)
                    }
                })
            }
            this.$store.commit('updateGlobalVar', { name: 'lessons', data: lessons })
        },
        multiDel() {
            let params = {
                lsf_ids: []
            }

            if (this.selectedList.length > 0) {
                this.selectedList.forEach(s => {
                    params.lsf_ids.push(s.lsf_id)
                })
            } else {
                this.$Message.error('您未选择课标')
                return
            }
            let tip = `确定删除所选${this.selectedList.length}条课标吗？`

            this.confirm(tip).then(() => {
                this.$rest('lesson_standard_files/delete_batch').post(params)
                    .success(data => {
                        this.$Message.success('删除成功！')
                        this.selectedList = []
                        this.init_data()
                    }).error(response => {
                        this.error(response.body.message || '删除失败')
                    })
            })

        },
        multiDisable(enable) {
            let params = {
                    lsf_ids: [],
                    enable: enable
                },
                operate = enable ? '启用' : '禁用'

            if (this.selectedList.length > 0) {
                this.selectedList.forEach(s => {
                    params.lsf_ids.push(s.lsf_id)
                })
            } else {
                this.$Message.error('您未选择课标')
                return
            }
            let tip = `确定${operate}所选${this.selectedList.length}条课标吗？`

            this.confirm(tip).then(() => {
                this.$rest('lesson_standard_files/enable').post(params)
                    .success(data => {
                        this.$Message.success(`${operate}成功！`)
                        this.selectedList = []
                        this.init_data()
                    }).error(response => {
                        this.error(response.body.message || `${operate}失败`)
                    })
            })
        },
        selectChange(data) {
            this.selectedList = data
        },
        preview(row) {
            this.$Modal.open('components/PreviewFile.vue@modal', {
                    props: {
                        list: this.currentFile.lesson_standard_file_item
                    }
                })
                .then(modal => {
                    modal.show('预览课标文件', 'add')
                })

        },
        textbook_view() {
            this.$Modal.open('system/basic/textbook-modal.vue', {})
                .then(modal => {
                    modal.show('教材管理')
                })
        },
        resetSearch() {
            this.$form('form').reset()
            this.init_data()
        },
        deal_data(data) {
            var list = data.list;
            list.forEach(item => {
                item.$check = false;
                item.$edit = false;
            })
            this.csList = list;
        },
        hook_get_param(params) {
            let search_obj = util.copy(this.search_field)
            params.with = 'lesson_standard_file_item,textbook,textbook_section'
            
            if (this.type_value == 'center') {
                params.og_id = 0
                params.bid = -1
            } else {
                delete params.og_id
                delete params.bid
            }

            for (let o in search_obj) {
                let property = search_obj[o]
                if (o == 'enable') {
                    if (property.length > 0) {
                        params[o] = util.sprintf('[In,%s]', property.join(','))
                    }
                } else if (property) {
                    params[o] = property
                }
            }
        },
        addInfo() {
            this.$refs.info.show('添加课标', 'add')
        },
        editInfo(row) {
            let title = util.sprintf('编辑课标【%s】', row.title)

            this.$refs.info
                .set('info', row)
                .set('type', row.lid ? 'lesson' : row.tb_id ? 'textbook' : 'course_case')
                .set('viewMode', false)
                .show(title, 'edit')
        },
        delInfo(row) {
            let title = util.sprintf('编辑课标【%s】', row.title)
            this.confirm(title).then(() => {
                this.delete(row)
            })
        },
        viewInfo(row) {
            let title = util.sprintf('查看课标【%s】', row.title)

            this.$refs.info
                .set('info', row)
                .set('viewMode', true)
                .show(title, 'view')
        },
        opClick(type, item) {
            if (type == 'edit') {
                this.editInfo(item)
            } else if (type == 'del') {
                this.delInfo(item)
            } else if (type == 'pptFile') {
                this.pptFileManage(item)
            } else {
                this.viewInfo(item)
            }
        },
        sortItem(row) {
            this.$rest('lesson_standard_files/' + row.lsf_id).put(row)
                .success(data => {
                    this.$Message.success('排序成功！')
                    this.$set(row, '$edit', false)
                }).error(response => {
                    this.error(response.body.message || '排序失败！')
                })
        }
    }
}
</script>