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
            <span class="search-box">
                <Input v-model="search_field.name" size="small" placeholder="模板名" style="width: 200px"></Input>
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
                name: ''
            },
            cates: [],
            column_keys: {
                name: {
                    title: '模板名称',
                    show:true
                },
                operation: {
                    title: '操作',
                    show: true,
                    width: 150
                }
            },
            column_render: {
                operation (h,params) {
                    let UpdateElement = h('Button', {
                        props: {
                            type: 'ghost',
                            shape: 'circle',
                            icon: 'edit',
                            size: 'small'
                        },
                        attrs: {
                            title: '编辑'
                        },
                        on: {
                            click: () => {
                                this.$Modal.open('system/configs/homework-tpl/tpl-content.vue@modal',{
                                    on: {
                                        'on-success':() => {
                                            this.init_data()
                                        }
                                    }
                                })
                                .then(modal => {
                                    modal.set('ht_id',params.row.ht_id).show('编辑作业模板')
                                })
                            }
                        }
                    });
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
                        },
                        style: {
                            marginLeft: '10px'
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
                    return h('span', [UpdateElement,DeleteElement, CopyElement])
                }
            },
            pageIndex: 1
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
            this.$Modal.open('system/configs/homework-tpl/tpl-content.vue@modal',{
                on: {
                    'on-success':() => {
                        this.init_data()
                    }
                }
            })
            .then(modal => {
                modal.show('添加作业模板','add')
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
