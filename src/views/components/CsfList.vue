<template>
    <div>
        <div :lg="6" :md="8" :sm="12" v-for="(item, index) in list" :key="index" style="margin-bottom: 20px">
            <div class="cs-bg" :class="{'cs-check-active':item.$check || checkIndex == index,'cs-check-mode':checkMode}" @click="changeCheck(item, index)">
                <dir class="cs-check-wrap" v-if="type === 'select'">
                    <Checkbox class="cs-check" v-model="item.$check" @click='onChange(index)' @on-change='onChange(index)' />
                </dir>
                <div class="cs-title">
                    <span style="font-weight:bold;font-size:15px">{{item.title + ':'}}</span>
                    <!--<span v-if="item.lid>0">{{item.lid}}</span>-->
                    <!--<span v-else-if="item.tb_id>0&&item.textbook">{{item.textbook.tb_name}}</span>-->
                </div>
                <div class="cs-desc">
                    <span>课标类型：{{item.csft_did|dict_title('course_standard_file_type')}}</span>
                    <span v-if="item.lid">章节序号：{{item.chapter_index}}</span>
                    <span v-else-if="item.tbs_id">章节序号：{{item.textbook_section.sort}}</span>
                    <span v-if="item.textbook_section">章节名：{{item.textbook_section.section_title}}</span>
                </div>
                <div class="cs-img" @click.native="opClick('view',item)">
                    <img v-if="item.lesson_standard_file_item.length == 0" src="@/img/cs-none.png">
                    <template v-else-if="item.lesson_standard_file_item.length < 10" v-for="(img, index) in item.lesson_standard_file_item">
                        <img v-if="img.media_type == 'image'" :src="img.file_url" :key="index" @click.stop="chooseImg(item, index, img.file_id)" :class="{'cs-check-active' : imgArray.includes(img.file_id)}">
                        <img v-else-if="img.media_type == 'video'" :src="img.file_url|video_cover_url_filter" :key="index" @click.stop="chooseImg(item, index, img.file_id)" :class="{'cs-check-active' : imgArray.includes(img.file_id)}">
                        <img v-else src="http://sp1.xiao360.com/static/file/icon/default.png" :key="index">
                    </template>
                    <template v-else v-for="(img, index) in item.lesson_standard_file_item.slice(1, 11)">
                        <img v-if="img.media_type == 'image'" :src="img.file_url" :key="index" @click.stop="chooseImg(item, index, img.file_id)" :class="{'cs-check-active' : imgArray.includes(img.file_id)}">
                        <img v-else-if="img.media_type == 'video'" :src="img.file_url|video_cover_url_filter" :key="index" @click.stop="chooseImg(item, index, img.file_id)" :class="{'cs-check-active' : imgArray.includes(img.file_id)}">
                        <img v-else src="http://sp1.xiao360.com/static/file/icon/default.png" :key="index">
                    </template>
                </div>
                <div class="cs-status" v-if="type === 'select'">
                    <span v-if="item.enable">
                        <Icon type="ios-checkmark" size="16" color="#00CC66"></Icon>
                    </span>
                    <span v-else>
                        <Icon type="ios-minus" size="16" color="#FF1717"></Icon>
                    </span>
                </div>
                <div class="cs-op" v-if="type === 'select'">
                    <Dropdown trigger="click">
                        <Button type="primary" size="small">
                            操作
                            <Icon type="arrow-down-b"></Icon>
                        </Button>
                        <DropdownMenu slot="list">
                            <!-- <DropdownItem @click.native="opClick('pptFile',item)" v-if="!(is_orgs&&type_value=='center')">PPT附件管理</DropdownItem> -->
                            <DropdownItem @click.native="seeClick('view',item)">查看</DropdownItem>
                            <DropdownItem @click.native="editClick('edit',item)" v-per="'course_standard_file.edit'" v-if="!(is_orgs&&typevalue=='center')">编辑</DropdownItem>
                            <DropdownItem @click.native="delateClick('del',item)" v-per="'course_standard_file.delete'" v-if="!(is_orgs&&typevalue=='center')">删除</DropdownItem>
                            
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import util from '@/libs/util'
import grid from '@/libs/grid.mixin'
import common from '@/libs/common.mixin'
import globals from '@/libs/globals.mixin'
export default {
    mixins: [grid, common, globals],
    name: 'CsfList',
    props: {
        list: {
            type: Array
        },
        checkMode: {
            type: Boolean
        },
        typevalue: {
            type: String
        },
        type: {
            type: String
        },
        checkIndex: {
            type: Number
        }
    },
    data () {
        return {
            imgArray: [] // 图片唯一标识
        }
    },
    filters:{
        video_cover_url_filter(val){
            if(val.indexOf('xiao360.com') !== -1){
                val = val + '?vframe/jpg/offset/1/w/100/h/100'
            }else if(val.indexOf('oss') !== -1){
                val = val +'?x-oss-process=video/snapshot,t_1000,f_jpg,w_100,h_100,m_fast'
            }else{
                val = 'http://sp1.xiao360.com/static/img/blackbg.jpg'
            }
            return val
        }
    },
    methods: {
        changeCheck(item, index) {
            this.$emit("changeCheckFromView", item, index)
        },
        onChange(index) {
            this.$emit("onchange", index)
        },
        editClick(type, item) {
            this.$emit("opClick", "edit", item)
        },
        delateClick(type, item) {
            this.$emit("opClick", "del", item)
        },
        seeClick(type, item) {
            this.$emit("opClick", "view", item)
        },
        chooseImg(item, index, imgFile_id) {
            if(this.type === "select"){
                return false
            }           
            this.$emit("chooseImg", item, index)
            if(this.imgArray.includes(imgFile_id)){
                let imgId = this.imgArray.indexOf(imgFile_id)
                this.imgArray.splice(imgId, 1)
            } else {
                this.imgArray.push(imgFile_id)
            }  
        }
    }
}
</script>
<style scoped>
.cs-bg {
    background-color: #fff;
    transition: all 0.2s;
    height: 150px;
    width: 100%;
    padding: 15px 10px;
    position: relative;
    margin: 10px auto;
    border-bottom: 1px solid #f2f2f2;
}

.cs-bg:hover {
    box-shadow: 0px 0px 10px #DDD;
}

.cs-img {
    height: 100%;
    display: inline-block;
    vertical-align: top;
}

.cs-img img {
    width: 70px;
    height: 70px;
    max-width: 100%;
    max-height: 100%;
    margin-top: 20px;
    margin-right: 20px;
}


.cs-title {
    position: absolute;
    top: 0px;
    left: 10px;
}

.cs-desc {
    margin-top: 20px;
}


.cs-desc>span {
    margin-right: 20px;
}

.cs-status {
    font-size: 13px;
    position: absolute;
    top: 5px;
    right: 15px;
}

.cs-op {
    position: absolute;
    bottom: 5px;
    right: 10px;
}

.cs-check-active {
    border: 1px solid #3399ff;
}

.cs-check-mode {
    cursor: pointer;
}

.cs-check-wrap {
    position: absolute;
    right: 5px;
    top: 45px;
}

.cs-check {
    margin-top: 2px;
}
</style>