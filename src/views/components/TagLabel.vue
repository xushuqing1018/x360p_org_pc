<style scoped>
.tag-label {
    display: inline-block;
}

.show-tag {
    height: 20px;
    line-height: 18px;
    font-size: 11px;
    margin-right: 0px;
}

.tip-title {
    font-weight: bold;
    font-size: 13px;
}

.tip-title a {
    font-weight: normal;
    font-size: 12px;
    color: #39f;
}

.tag-tip button {
    background-color: transparent !important;
    padding: 0px 5px !important;
}

.add-tag-btn {
    background-color: transparent !important;
    padding: 0px 5px !important;
}
</style>

<template>
    <div class="tag-label">
        <div v-if="sortList.length != 0" style="display: inline-block">
            <Tag :color="sortList[0].color" type="border" class="show-tag">{{sortList[0].tag_name}}</Tag>
            <Poptip v-if="sortList.length > 1" trigger="hover" transfer placement="right-start" class="tag-tip">
                <Button size="small" icon="more"></Button>
                <div slot="title" class="tip-title">
                    所有标签
                    <a style="float: right" @click="manageTag">管理</a>
                </div>
                <div slot="content">
                    <div v-for="(item,index) in sortList" :key="index" v-if="index != 0" style="margin-bottom: 5px">
                        <Tag :color="item.color">{{item.tag_name}}</Tag>
                    </div>
                </div>
            </Poptip>
        </div>
        <Button class="add-tag-btn" v-if="sortList.length <= 1" size="small" icon="pricetag" type="dashed" title="添加标签" @click="manageTag"></Button>
    </div>
</template>

<script>
export default {
    name: 'TagLabel',
    props: {
        list: {
            type: Array,
            default: () => {
                return []
            }
        },
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
            sortList: []
        }
    },
    mounted() {
        this.sortTagData();
    },
    methods: {
        sortTagData() {
            this.sortList = this.list;
            this.sortList.sort((a, b) => {
                return b.sort - a.sort
            })
        },
        manageTag() {
            this.$Modal.open('components/TagManageModal.vue@modal',{
                props: {
                    type: this.type,
                    id: this.id,
                    objName: this.objName
                },
                on: {
                    update: () => {
                        this.$emit('update');
                    }
                }
            })
            .then(modal => {
                modal.show('标签管理');
            })
        }
    }
}
</script>
