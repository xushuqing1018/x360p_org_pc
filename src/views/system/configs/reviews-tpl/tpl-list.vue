<style scoped>
.action-bar {
    margin-bottom: 10px;
}

.search-box {
    float: right;
    margin-right: 5px;
}
</style>

<template>
    <div>
        <div class="action-bar">
            <Button type="primary" size="small" icon="plus" @click="addInfo">添加</Button>
            <Button type="primary" size="small" icon="funnel" @click="tplSort" v-if="showSwitchTpl">分类</Button>
            <span class="search-box">
                <Input v-model="search_field.name" size="small" placeholder="模板名" style="width: 200px"></Input>
                <Select 
                    v-model="search_field.rtc_id" 
                    size="small" 
                    clearable
                    placeholder="所属分类" 
                    style="width: 200px" 
                    v-if="cates.length"
                    >
                    <Option :value="item.rtc_id" v-for="item in cates">{{item.name}}</Option>
                </Select>
                <Button type="primary" size="small" icon="search" @click="search">搜索</Button>
            </span>
        </div>
        <div>
            <Table :columns="columns" :data="list" :page="pageIndex" :page-size="pageSize"></Table>
            <Page
                style="float: right;margin: 10px 10px 0px 0px"
                :total="totalNum"
                :current="pageIndex"
                :page-size="10"
                :show-total="true"
                @on-change="pagenation"
                >
            </Page>
        </div>
    </div>
</template>

<script>
import util from '@/libs/util'
import grid from '@/libs/grid.mixin'
import common from '@/libs/common.mixin'

export default {
    mixins: [grid,common],
    props: {
        list: {
            type: Array,
            default: () => {
                return []
            }
        },
        totalNum: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            search_field: {
                name: '',
                rtc_id: 0
            },
            cates: [],
            column_keys: {
                name: {
                    title: '模板名称',
                    show:true
                },
                rtc_id: {
                    title: '所属分类',
                    show: true
                },
                operation: {
                    title: '操作',
                    show: true,
                    width: 150
                }
            },
            column_render: {
                name (h,params) {
                    let NameElement = h('a', {
                        on: {
                            click: () => {
                                this.$emit('on-select', params.index);
                            }
                        },
                        style: {
                            color: '#39f'
                        }
                    }, params.row.name);
                    let StyleTagElement = h('Tag',{
                        props: {
                            color: 'red',
                            size: 'small'
                        },
                        style: {
                            marginLeft: '5px'
                        }
                    }, '专业');
                    let DefaultTagElement = h('Tag',{
                        props: {
                            color: 'blue',
                            size: 'small'
                        },
                        style: {
                            marginLeft: '5px'
                        }
                    }, '默认');
                    // if(params.index == 0) {
                    //     return h('span', [NameElement, DefaultTagElement])
                    // }
                    {
                        if(params.row.review_style == 0){
                            return h('span', [NameElement])
                        }
                        else {
                            return h('span', [NameElement, StyleTagElement])
                        }
                    }
                },
                rtc_id (h,params) {
                    if(params.row.review_tpl_cate) {
                        return h('span',params.row.review_tpl_cate.name)
                    }else{
                        return h('span',{
                            style: {
                                color: '#ccc'
                            }
                        },'还没有设置分类')
                    }
                },
                operation (h,params) {
                    let DeleteElement = h('Button', {
                        props: {
                            type: 'ghost',
                            shape: 'circle',
                            icon: 'ios-trash',
                            size: 'small'
                        },
                        attrs: {
                            title: '删除'
                        },
                        on: {
                            click: () => {
                                this.$Modal.confirm({
                                    content: `确认删除模板【${params.row.name}】`,
                                    onOk: () => {
                                        this.$emit('on-delete', params.row);
                                    }
                                })
                            }
                        }
                    });
                    let CopyElement = h('Button', {
                        props: {
                            type: 'ghost',
                            shape: 'circle',
                            icon: 'ios-copy',
                            size: 'small'
                        },
                        attrs: {
                            title: '复制'
                        },
                        on: {
                            click: () => {
                                this.$Modal.confirm({
                                    content: `复制模板【${params.row.name}】，这将新增一个该模板的副本`,
                                    onOk: () => {
                                        this.$emit('on-copy', params.index);
                                    }
                                })
                            }
                        },
                        style: {
                            marginLeft: '10px'
                        }
                    });
                    return h('span', [DeleteElement, CopyElement])
                }
            },
            pageIndex: 1
        }
    },
    created() {
        if(!this.showSwitchTpl) {
            delete this.column_keys['rtc_id']
        }
    },
    mounted() {
        this.initCates()
    },
    methods: {
        initCates() {
            this.$rest('review_tpl_cates')
            .get({
                pagesize:100
            })
            .success(res => {
                this.cates = res.list
            })
            .error(res => {
                this.$Message.error(res.body.message)
            })
        },
        addInfo() {
            this.$Modal.open('system/configs/reviews-tpl/select-tpl-type.vue@modal',{
                on: {
                    'on-ok': (val) => {
                        let obj = {};
                        if(val == 'custom') {
                            obj = {
                                setting: util.copy(this.$store.state.gvars.configs.review_tpl),
                                name: '普通模板名称',
                                review_style: 0
                            }
                        }
                        else {
                            obj = {
                                setting: util.copy(this.$store.state.gvars.review_styles[1]),
                                name: '专业模板名称',
                                review_style: 1
                            }
                        }
                        this.$emit('on-add', val)
                    }
                }
            })
            .then(modal => {
                modal.show('选择要添加的模板类型')
            })
        },
        tplSort() {
            this.$Modal.open('system/configs/reviews-tpl/tpl-cate.vue@modal',{
                props: {
                    'allow-select':false
                },
                on: {
                    'save':() => {
                        this.$emit('search',this.search_field)
                    },
                    'on-init-cate':() => {
                        this.initCates()
                    }
                }
            })
            .then(modal => {
                modal.show('课评模板分类')
            })
        },
        pagenation(index) {
            this.pageIndex = index;
            this.$emit('pagenation',index)
        },
        search() {
            this.pageIndex = 1;
            this.$emit('search',this.search_field)
        },
        reset() {
            this.pageIndex = 1;
            this.search_field.name = '';
            this.search_field.rtc_id = 0
            this.$emit('search',this.search_field)
        }
    }
}
</script>
