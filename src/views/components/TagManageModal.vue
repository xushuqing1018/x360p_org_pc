<style scoped>
.tag {
    margin-right: 10px;
    height: 28px;
    line-height: 28px;
    margin-bottom: 10px;
}

.add-input-box {
    width: 93px;
    display: inline-block;
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

.no-tag {
    color: #39f;
    margin-bottom: 10px;
}

.tag-color-dot {
    margin-left: 5px;
    position: relative;
    top: 2px;
}

.section {
    font-size: 12px;
    border-bottom: 1px solid #DDD;
    margin-bottom: 10px;
    color: #888;
}

.top-dot {
    width: 18px;
    height: 18px;
    background-color: #ed3f14;
    position: absolute;
    top: -16px;
    left: -6px;
    border-radius: 50%;
    font-size: 11px;
    color: white;
    z-index: 1;
    line-height: 18px;
    text-align: center;
}
</style>

<template>
    <Modal v-drag-modal v-model="modal$.show" width="450" :title="tagModalTitle" :mask-closable="false">
    	<div class="tag-modal-content">
            <template v-if="tagList.length != 0">
                <div class="section"><Icon type="ios-pricetag-outline"/> {{this.objName}}已有标签</div>
                <div>
                    <span v-for="(item,index) in tagList" style="position: relative">
                        <div class="top-dot" v-if="index == 0">顶</div>
                        <Tag type="border" closable @on-close="deleteTag" :color="item.color" :name="item.tr_id" class="tag" @click="topping(index,item.tr_id)">{{item.tag.tag_name}}</Tag>
                    </span>
                </div>
            </template>
            <div class="no-tag" v-else>暂无标签~</div>
            <div class="section" style="margin-top: 10px">
                <Tooltip :content="'选择下面的标签给【'+this.objName+'】添加标签'" placement="right">
                    <Icon type="ios-arrow-up"/> 添加
                </Tooltip>
            </div>
            <div>
                <Tag type="border" :color="item.color" v-for="item in addTagList" class="tag" @click="addTagFromList(item)">{{item.tag_name}}</Tag>
            </div>
            <Button icon="plus" type="dashed" v-if="!addMode" @click="changeAddMode"></Button>
            <div class="add-tag-box" v-else>
                <div class="add-input-box">
                    <Input v-model="addTagData.name" placeholder="新标签名"></Input>
                </div>
                <Icon type="record" :color="addTagData.color" size="15" class="tag-color-dot"></Icon>
                <Select v-model="addTagData.color" style="width: 70px">
                    <Option v-for="(item,index) in colorList" :value="item.value" :key="index">
                        <Icon type="record" :color="item.value" style="margin-right: 5px"></Icon>{{item.alias}}
                    </Option>
                </Select>
                <Checkbox v-model="addTagData.isPrivate" :true-value="1" :false-value="0" style="margin-left: 5px">私人标签</Checkbox>
                <ButtonGroup style="margin-left: 5px">
                    <Button icon="checkmark-round" type="success" @click="addTag"></Button>
                    <Button icon="close-round" @click="changeAddMode" style="background-color: white"></Button>
                </ButtonGroup>
            </div>
        </div>
        <div slot="footer">
            <Button type="default" @click="close">关闭</Button>
        </div>
    </Modal>
</template>

<script>
import modal from '@/libs/modal.mixin'
import common from '@/libs/common.mixin'

export default {
    name: 'TagManageModal',
    mixins: [modal, common],
    props: {
        type: {
            type: Number,
            default: 1
        },
        id: {
            type: Number,
            default: 0
        },
        objName: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            tagList: [],
            addTagList: [],
            colorList: [
                {
                    alias: '红色',
                    value: '#f5222d'
                },
                {
                    alias: '橙色',
                    value: '#fa8c16'
                },
                {
                    alias: '金色',
                    value: '#faad14'
                },
                {
                    alias: '湖蓝色',
                    value: '#13c2c2'
                },
                {
                    alias: '蓝色',
                    value: '#1890ff'
                },
                {
                    alias: '紫色',
                    value: '#722ed1'
                }
            ],
            addMode: false,
            addTagData: {
                name: '',
                color: '#faad14',
                isPrivate: 0
            },
            adding: false
        }
    },
    mounted() {
        this.initData();
    },
    computed: {
        tagModalTitle() {
            return `【${this.objName}】标签管理`
        }
    },
    methods: {
        topping(index, id) {
            if(index == 0) {
                return
            }
            this.$Modal.confirm({
                content: '是否置顶该便签？',
                onOk: () => {
                    this.$http.put('tag_relations/'+id, {
                        sort: this.tagList[0].sort + 1
                    })
                    .then(res => {
                        this.$Message.success('置顶成功');
                        this.initData();
                        this.$emit('update');
                    },res => {
                        this.error(res.body.message)
                    })
                }
            })

        },
        initAddTagData() {
            this.$http.get('tags',{
                params: {
                    tag_type: this.type
                }
            })
            .then(res => {
                let list = res.body.data.list;
                let filterList = list.filter(item => {
                    let has = this.tagList.some(item2 => {
                        if(item2.tag_id == item.tag_id) {
                            return true
                        }
                        return false
                    })
                    if(!has) {
                        return true
                    }
                    else {
                        return false
                    }
                })
                this.addTagList = filterList;
                this.adding = false;
            },res => {
                this.$Message.error(res.body.message);
            })
        },
        initData() {
            this.$http.get('tag_relations',{
                params: {
                    tag_type: this.type,
                    relate_id: this.id,
                    with: 'tag'
                }
            })
            .then(res => {
                let list = res.body.data.list;
                //过滤私人标签
                let filterList = list.filter(item => {
                    if(item.is_private == 0) {
                        return true
                    }
                    else {
                        let uid = this.uid$;
                        if(uid == item.create_uid || this.is_admin) {
                            return true
                        }
                        else {
                            return false
                        }
                    }
                })
                filterList.sort((a, b) => {
                    return b.sort - a.sort
                })
                this.tagList = filterList;
                this.initAddTagData();
            },res => {
                this.$Message.error(res.body.message);
            })
        },
        changeAddMode() {
            this.addMode = !this.addMode;
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
                is_private: this.addTagData.isPrivate
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
        addTagFromList(item) {
            if(this.adding) {
                return
            }
            this.adding = true;
            this.$http.post('tag_relations',{
                tag_type: this.type,
                relate_id: this.id,
                tag_name: item.tag_name,
                color: item.color,
                is_private: 0
            })
            .then(res => {
                this.$Message.success('添加标签成功');
                this.initData();
                this.$emit('update');
            },res => {
                this.error(res.body.message);
            })
        },
        deleteTag(event, id) {
            this.$Modal.confirm({
                content: '确认删除该标签？',
                onOk: ()=> {
                    this.$http.delete('tag_relations/' + id)
                    .then(res => {
                        this.$Message.success('删除标签成功');
                        this.initData();
                        this.$emit('update');
                    },res => {
                        this.error(res.body.message);
                    })
                }
            })
        }
    }
}
</script>