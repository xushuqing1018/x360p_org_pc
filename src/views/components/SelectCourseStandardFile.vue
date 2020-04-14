<template>
  <Modal
    v-drag-modal
    v-model="modal$.show"
    :title="modal$.title"
    width="900"
    :mask-closable="false"
  >
    <div class="row">
      <div class="col-md-4 border-right">
        <RadioGroup
	        size="small"
          v-model="type"
          type="button"
          @on-change="onTypeChange"
          style="margin-bottom: 10px"
        >
          <Radio :label="1">课程</Radio>
          <Radio :label="2">教材</Radio>
        </RadioGroup>
        <template v-if="type==1">
          <div class="search">
            <Input size="small" v-model="lesson_name" placeholder="请输入课程名搜索" icon="ios-search"></Input>
          </div>
          <div class="list mt-3" style="max-height: 400px;overflow: auto;">
            <div
              class="list-item"
              :class="currentLesson == item?'active':''"
              v-for="(item,index) in filterLessons"
              @click="currentLesson = item;checkIndex = -1"
            >
              <span>{{item.lesson_name}}</span>
            </div>
          </div>
        </template>
        <template v-if="type==2">
          <div class="search">
            <Input v-model="tb_name" placeholder="请输入教材名搜索" icon="ios-search"></Input>
          </div>
          <div class="list mt-3" style="max-height: 400px;overflow: auto;">
            <div
              class="list-item"
              :class="currentTb == item?'active':''"
              v-for="(item,index) in tbData"
              @click="currentTb = item;checkIndex = -1"
            >
              <span>{{item.tb_name}}</span>
            </div>
          </div>
        </template>
      </div>
      <div class="col-md-8">
        <div class="mb-3 clear">
          <Input
            v-model="search_field.title"
            size="small"
            placeholder="课标标题"
            style="display: inline-block;width:120px"
          ></Input>
          <label class="mr-2">课标类型</label>
          <Select
            size="small"
            v-model="search_field.csft_did"
            style="display: inline-block;width:120px;"
          >
            <Option :value="0">不限</Option>
            <Option
              :value="item.did"
              v-for="item in dicts('course_standard_file_type')"
              :key="item.did"
            >{{item.title}}</Option>
          </Select>
          <label class="ml-2 mr-2">章节</label>
          <Input
            size="small"
            v-model.number="search_field.chapter_index"
            style="display: inline-block;width:120px;"
            placeholder="不限"
            v-if="type==1"
          ></Input>
          <Select
            size="small"
            v-model="search_field.tbs_id"
            style="display: inline-block;width:120px;"
            v-else
          >
            <Option :value="0">不限</Option>
            <Option
              :value="item.tbs_id"
              v-for="item in sectionData"
              :key="item.tbs_id"
            >第{{item.sort}}章：{{item.section_title}}</Option>
          </Select>
          </div>
          <div class="row">
            <div class="col-sm-6">
              <RadioGroup
                size="small"
                v-model="show_type"
                type="button"
                style="margin-top: 10px"
              >
                <Radio label="list">
                  <Icon type="ios-list-outline"></Icon>列表
                </Radio>
                <Radio label="view">
                  <Icon type="ios-grid-view"></Icon>视图
                </Radio>
              </RadioGroup>
            </div>
            <div class="col-sm-6">
              <div class="pull-right" v-if="is_orgs" style="line-height: 2.5;">
                <label>范围：</label>
                <ButtonGroup size="small">
                  <Button
                    :type="type_value=='local'?'primary':'ghost'"
                    size="small"
                    icon="android-person"
                    @click="type_value='local'"
                  >本地</Button>
                  <Button
                    :type="type_value=='center'?'primary':'ghost'"
                    size="small"
                    icon="android-people"
                    @click="type_value='center'"
                  >总部</Button>
                </ButtonGroup>
              </div>
            </div>
        </div>
        <div style="height: 400px;overflow-y: auto;">
          <csf-list
            v-if="show_type == 'list'"
            :list="sfList"
            @changeCheckFromView="selectSF"
            @chooseImg="select"
            :type="callType"
            :checkIndex="checkIndex"
          ></csf-list>
          <Row :gutter="32" style="margin: 2px 0px;" v-if="show_type == 'view'">
            <Col span="12" v-for="(item,index) in sfList" :key="index" style="margin-bottom: 20px;">
              <div
                class="cs-bg"
                :class="{'cs-check-active':checkIndex == index,'cs-check-mode':true}"
                @click="selectSF(item, index)"
              >
                <div class="cs-img">
                  <img v-if="item.lesson_standard_file_item.length == 0" src="@/img/cs-none.png" />
                  <template v-else>
                    <img
                      v-if="item.lesson_standard_file_item[0].media_type == 'image'"
                      :src="item.lesson_standard_file_item[0].file_url"
                    />
                    <img
                      v-else-if="item.lesson_standard_file_item[0].media_type == 'video'"
                      :src="item.lesson_standard_file_item[0].file_url+'?vframe/jpg/offset/1/w/100/h/100'"
                    />
                    <img v-else src="@/img/cs-none.png" />
                  </template>
                </div>
                <!--
                -->
                <div class="cs-content">
                  <div class="cs-title">
                    <p class="title">{{item.title}}</p>
                    <p v-if="item.lid">{{item.lid|lesson_name}}</p>
                    <p v-else>{{item.textbook?item.textbook.tb_name:'-'}}</p>
                  </div>
                  <div class="cs-desc">
                    <p>课标类型：{{labelDicts(item.csft_did,'course_standard_file_type')}}</p>
                    <p v-if="item.lid">章节序号：{{item.chapter_index}}</p>
                    <template v-else>
                      <p>章节序号：{{item.textbook_section?item.textbook_section.sort:'-'}}</p>
                      <p>章节名：{{item.textbook_section?item.textbook_section.section_title:'-'}}</p>
                    </template>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
          <div class="text-center" v-if="sfList.length==0">没有数据</div>
        </div>
        <div class="pagenation text-right mt-3">
          <Page
            size="small"
            :total="total"
            :current="pageIndex"
            :show-sizer="true"
            :page-size="pageSize"
            :show-total="true"
            @on-change="pagenation"
            @on-page-size-change="pagesize"
          ></Page>
        </div>
      </div>
    </div>

    <div slot="footer">
      <Button type="ghost" @click="close">关闭</Button>
      <Button type="primary" @click="ok">确定</Button>
    </div>
  </Modal>
</template>
<script>
import util, { _ } from "@/libs/util";
import grid from "@/libs/grid.mixin";
import modal from "@/libs/modal.mixin";
import common from "@/libs/common.mixin";
import globals from "@/libs/globals.mixin";
import CsfList from "c%/CsfList.vue";

export default {
  mixins: [grid, common, modal, globals],
  components: {
    CsfList
  },
  data() {
    return {
      show_type: "list",
      callType: "preview",
      rest_api: "lesson_standard_files",
      data: [],
      lesson_name: "",
      currentLesson: {},
      currentFile: {},
      csft_did: 0,
      chapter_index: "",
      type_value: "local",
      centerLessons: [],
      sfList: [],
      checkIndex: -1,
      type: 1,
      tb_name: "",
      tbData: [],
      ccData: [],
      currentTb: {},
      sectionData: [],
      search_field: {
        csft_did: 0,
        chapter_index: "",
        tbs_id: 0,
        title: ""
      },
      epArray: [] //存放课表的空数组
    };
  },
  watch: {
    "modal$.show": function(val) {
      if (val) {
        this.init();
      }
    },
    "currentLesson.lid": function(val) {
      this.resetSearchField();
      this.init_data();
    },
    currentTb: function(val) {
      this.resetSearchField();
      this.getTextbookSection();
      this.init_data();
    },
    type_value: function(val) {
      this.init();
    },
    "$store.state.lesson_standard_file": function(val) {
      this.sfList = val;
    },
    tb_name: function(val) {
      this.getTbData();
    },
    "search_field.tbs_id": "init_data",
    "search_field.chapter_index": "init_data",
    "search_field.csft_did": "init_data"
  },
  mounted() {
    /*
    if (_.isEmpty(this.currentLesson) && this.lessons.length > 0) {
      this.currentLesson = this.lessons[0];
    }*/
    if(this.is_orgs){
      this.type_value = 'center'
    }
  },
  methods: {
    getTbData() {
      let params = {
        pagesize: 100
      };
      if (this.tb_name != "") {
        params.tb_name = this.tb_name;
      }
      this.$http
        .get("textbooks", {
          params: params
        })
        .then(
          res => {
            var list = res.body.data.list;
            this.tbData = list;
            if (list.length > 0) {
              this.currentTb = this.tbData[0];
              this.init_data();
            }
          },
          res => {
            this.$Message.error(res.body.message);
          }
        );
    },
    getTextbookSection() {
      this.$http
        .get("textbook_sections", {
          params: {
            tb_id: this.currentTb.tb_id,
            pagesize: 100
          }
        })
        .then(
          res => {
            var list = res.body.data.list;
            list.sort((a, b) => {
              return a.sort - b.sort;
            });
            this.sectionData = list;
          },
          res => {
            this.$Message.error(res.body.message);
          }
        );
    },
    resetSearchField() {
      this.search_field.chapter_index = "";
      this.search_field.tbs_id = 0;
      this.search_field.csft_did = 0;
    },
    onTypeChange(type) {
      if (type == 1) {
        this.init();
        if (!_.isEmpty(this.currentLesson) && this.lessons.length > 0) {
          this.init_data();
        }
      } else{
        this.getTbData();
      }
    },
    selectSF(item, index) {
      this.currentFile = item;
      this.checkIndex = index;
    },
    select(item, index) {
      this.currentFile = item;
      if (item.lesson_standard_file_item.length > 0) {
        let itemArray = this.currentFile.lesson_standard_file_item[index];
        if (this.epArray.includes(itemArray)) {
          let index = this.epArray.indexOf(itemArray);
          this.epArray.splice(index, 1);
        } else {
          this.epArray.push(itemArray);
        }
      }
    },
    getCenterLessons() {
      this.dr()
        .getData("lessons?pagesize=10000&og_id=0&bid=-1&&bids=-1")
        .then(
          data => {
            if (data.list) {
              this.updateGvarsLessons(data.list);
            }
          },
          response => {
            this.$Notice.warning({
              title: "提示",
              desc: response.body.message || "获取总部课标失败~"
            });
          }
        );
    },
    updateGvarsLessons(list) {
      let lessons = this.gvars("lessons");

      if (list.length > 0) {
        list.forEach(l => {
          if (lessons.findIndex(lesson => lesson.lid == l.lid) == -1) {
            lessons.push(l);
          }
        });
      }

      this.$store.commit("updateGlobalVar", { name: "lessons", data: lessons });
    },
    previewFile(item) {
      this.$Modal
        .open("components/PreviewFile.vue@modal", {
          props: {
            list: item.lesson_standard_file_item
          }
        })
        .then(modal => {
          modal.show("预览课标文件", "add");
        });
    },
    ok() {
      if (_.isEmpty(this.currentFile)) {
        this.$Message.error("请选择课标");
        return false;
      }
      if (this.epArray.length > 0) {
        this.$emit("on-selected", [...new Set(this.epArray)]);
        this.epArray = [];
      }
      this.$emit("on-selected", this.currentFile.lesson_standard_file_item);
      this.close();
    },
    init() {
      if (this.type == 1) {
        let list = this.$store.state.lesson_standard_file;
        if (this.type_value == "center") {
          this.getCenterLessons();
        }
        if (!list || !list.length) {
          this.init_data();
        }
      } else {
      }
    },
    lessonStandardFileSum(lid) {
      let list = this.sfList;
      return list.filter(l => l.lid == lid).length;
    },
    hook_get_param(params) {
      params.bid = -1;
      params.with = "lesson_standard_file_item,textbook,textbook_section";
      if (this.type == 1) {
        if(_.isEmpty(this.currentLesson)){
          params.lid = this.currentLesson.lid;
        }
        if (this.search_field.chapter_index) {
          params.chapter_index = this.search_field.chapter_index;
        }
      } else {
        params.tb_id = this.currentTb.tb_id;
        if (this.search_field.tbs_id) {
          params.tbs_id = this.search_field.tbs_id;
        }
      }
      if (this.search_field.title) {
        params.title = this.search_field.title;
      }
      if (this.search_field.csft_did) {
        params.csft_did = this.search_field.csft_did;
      }
      if (this.type_value == "center") {
        params.og_id = 0;
        params.bid = -1;
      } else {
        delete params.og_id;
        delete params.bid;
      }
    },
    deal_data(data) {
      this.$store.commit("updateLessonStandardFile", data.list);
      return data.list;
    }
  },
  computed: {
    lessons() {
      let lessons = this.$store.state.gvars.lessons || [],
        og_id = this.type_value == "local" ? this.og_id$ : 0;

      if (lessons && lessons.length > 0) {
        lessons = lessons.filter(l => l.og_id == og_id);
      }
      return lessons;
    },
    filterLessons() {
      let list = this.lessons;
      if (!/^\s*$/.test(this.lesson_name)) {
        list = list.filter(l => l.lesson_name.indexOf(this.lesson_name) > -1);
      }
      list = list.filter(item => item.is_standard === 1);
      return list;
    },
    standardFileList() {
      let list = this.sfList,
        ret = [];
      if (this.type == 1) {
        ret = list.filter(item => item.lid == this.currentLesson.lid);
      } else {
        ret = list;
      }

      if (this.csft_did) {
        ret = ret.filter(item => item.csft_did == this.csft_did);
      }
      if (this.chapter_index) {
        ret = ret.filter(item => item.chapter_index == this.chapter_index);
      }
      return ret;
    }
  }
};
</script>
<style scoped>
.x-badge {
  background: #63c2de !important;
}

.cs-bg {
  background-color: #f5f7f9;
  transition: all 0.2s;
  height: 130px;
  width: 100%;
  padding: 10px;
  position: relative;
}

.cs-bg:hover {
  box-shadow: 0px 0px 5px #ddd;
}

.cs-img {
  width: 30%;
  height: 100%;
  display: inline-block;
  vertical-align: top;
}

.cs-img img {
  width: 100%;
  height: 100%;
}

.cs-content {
  display: inline-block;
  vertical-align: top;
  width: 70%;
  height: 100%;
  color: #657180;
  position: absolute;
}

.cs-title {
  position: absolute;
  top: 0px;
  left: 10px;
}

.cs-title .title {
  width: 156px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 14px;
  font-weight: bold;
}

.cs-desc {
  position: absolute;
  top: 45px;
  left: 10px;
  line-height: 20px;
}

.cs-status {
  font-size: 12px;
  position: absolute;
  top: 21px;
  right: 15px;
}

.cs-op {
  position: absolute;
  bottom: 0px;
  right: 15px;
}

.cs-check-active {
  outline: 1px solid #3399ff;
}

.cs-check-mode {
  cursor: pointer;
}
</style>
<style lang="less" scoped>
.list-item {
  padding: 8px 0;
  padding-left: 10px;
  border-bottom: 1px solid #eee;

  &:hover,
  &.active {
    cursor: pointer;
    background: #f8f8f9;
    color: #3091f2;
  }
}
.border-right{
	border-right:1px dashed #f2f2f2;
}
</style>