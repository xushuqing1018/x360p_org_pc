<template>
  <Modal
    v-drag-modal
    v-model="modal$.show"
    :title="modal$.title"
    width="900"
    :mask-closable="false"
  >
    <div class="c-grid">
      <div class="box box-query">
        <Form ref="ref_search" :label-width="70" :model="search_field" class="filter-form row">
          <Form-item label="班级" prop="cid" class="col-md-4 col-sm-6">
            <select-class v-model="search_field.cid" clearable @input="search"></select-class>
          </Form-item>
          <Form-item :label="label_teacher" prop="eid" class="col-md-4 col-sm-6">
            <select-employee v-model="search_field.eid" :rid="1" clearable @input="search"></select-employee>
          </Form-item>
          <Form-item label="考勤时间" prop="int_day" class="col-md-4 col-sm-6">
            <date-range-picker
              v-model="search_field.int_day"
              @on-change="search"
              label="选择日期"
              placement="bottom"
              style="width:100%"
            ></date-range-picker>
          </Form-item>
        </Form>
        <Row class="basic">
          <Col span="24" class="mt-2" style="margin-left:0px;">
            <Button-group>
              <Button class="ml-2" type="primary" @click="search" icon="ios-search">查询</Button>
            </Button-group>
            <Button type="primary" icon="refresh" @click="resetSearch">重置</Button>
            <CheckboxGroup
              v-model="search_field.lesson_type"
              class="ml-2"
              style="display: inline-block;"
            >
              <Checkbox :label="0">班课</Checkbox>
              <Checkbox :label="1">一对一</Checkbox>
              <Checkbox :label="2">一对多</Checkbox>
            </CheckboxGroup>
            <div class="pull-right">
              <per-scope per="attendance.all" @on-change="perScopeChange"></per-scope>
            </div>
          </Col>
        </Row>
      </div>
      <div class="content">
        <div class="content-body">
          <div class="ivu-table-wrapper" v-loading.like="'class_attendances'">
            <div class="ivu-table">
              <div class="ivu-table-body">
                <table class="x-modal-table modal-table">
                  <thead>
                    <th>
                      <div class="ivu-table-cell">对象</div>
                    </th>
                    <th width="120">
                      <div class="ivu-table-cell">{{'老师'|translate}}</div>
                    </th>
                    <th width="120">
                      <div class="ivu-table-cell">{{'助教'|translate}}</div>
                    </th>
                    <th width="120" v-if="hasPer('app.ft')">
                      <div class="ivu-table-cell">是否翻译</div>
                    </th>
                    <th width="170">
                      <div class="ivu-table-cell">授课时间</div>
                    </th>
                    <th width="70">
                      <div class="ivu-table-cell">状态</div>
                    </th>
                    <th width="70">
                      <div class="ivu-table-cell">操作</div>
                    </th>
                  </thead>
                  <tr
                    v-for="item in data"
                    v-if="notTrial(item)"
                    :class="currentRow==item?'ivu-table-row-highlight':''"
                  >
                    
                    <td>
                      <div class="ivu-table-cell">
                        <template v-if="item.lesson_type>0">
                          <Tag v-for="item in item.student_name_list">{{item}}</Tag>
                        </template>
                        <Tag v-else>{{getAttendanceObject(item)}}</Tag>
                      </div>
                    </td>
                    <td>
                      <div class="ivu-table-cell">{{item.eid|employee_name}}</div>
                    </td>
                    <td>
                      <div class="ivu-table-cell">{{item.second_eids|enames('-')}}</div>
                    </td>
                    <td v-if="hasPer('app.ft')">
                      <div
                        class="ivu-table-cell"
                        v-if="item.ft_review&&item.ft_review.sent_status == 1"
                      >
                        <Tag color="blue">翻译中</Tag>
                      </div>
                      <div
                        class="ivu-table-cell"
                        v-else-if="item.ft_review&&item.ft_review.sent_status == 2"
                      >
                        <Tag color="green">已翻译</Tag>
                      </div>
                      <div
                        class="ivu-table-cell"
                        v-else-if="item.ft_review&&item.ft_review.sent_status == 0"
                      >
                        <Tag>未翻译</Tag>
                      </div>
                      <div class="ivu-table-cell" v-else>-</div>
                    </td>
                    <td>
                      <div
                        class="ivu-table-cell"
                      >{{item.int_day|int_date}} {{item.int_start_hour|int_hour}}~{{item.int_end_hour|int_hour}}</div>
                    </td>
                    <td>
                      <div class="ivu-table-cell">
                        <template v-if="item.review">
                          <Tag color="blue" v-if="item.review.is_draft">有草稿</Tag>
                          <Tag color="green" v-else>已评</Tag>
                        </template>
                        <template v-else>
                          <Tag color="default">未评</Tag>
                        </template>
                      </div>
                    </td>
                    <td>
                      <div class="ivu-table-cell">
                        <template v-if="item.review">
                          <Button icon="ios-checkmark-empty" type="primary" disabled="true" size="small">选择</Button>
                        </template>
                        <template v-else>
                          <Button icon="ios-checkmark-empty" type="primary" size="small" @click="rowClick(item)">选择</Button>
                        </template>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="data.length==0">
                    <td colspan="6">
                      <div class="ivu-table-cell text-center">没有数据</div>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="pagenation text-right mt-3">
          <Page
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
    </div>
    <review-record ref="record" scene="view"></review-record>
  </Modal>
</template>

<script>
import util, { _ } from "@/libs/util";
import grid from "@/libs/grid.mixin";
import modal from "@/libs/modal.mixin";
import common from "@/libs/common.mixin";
import globals from "@/libs/globals.mixin";
import ReviewRecord from "c%/ReviewModal.vue";
import selectEmployee from "c%/SelectEmployee.vue";
import dateRangePicker from "c%/DateRangePicker.vue";
import SelectClass from "c%/SelectClass.vue";

export default {
  mixins: [grid, common, modal, globals],
  components: {
    SelectClass,
    ReviewRecord,
    selectEmployee,
    dateRangePicker
  },
  data() {
    return {
      rest_api: "class_attendances",
      pk: "catt_id",
      mapLessonTyp: { 0: "班", 1: "一", 2: "多" },
      currentRow: {},
      search_field: {
        cid: 0,
        eid: 0,
        int_day: [],
        lesson_type: [0, 1, 2]
      },
      type_attendance: '',
    };
  },
  watch: {
    type_attendance() {
      this.init_data();
    }
  },
  filters: {
    sent_status_text(val) {
      if (val == 0 || val == 1) {
        return "未翻译";
      } else if (val == "") {
        return "-";
      } else {
        return "已翻译";
      }
    }
  },
  computed: {
    have_all_permissions() {
      let result = false;
      if (this.$store.state.user.info.disable_pers.length <= 1) {
        result = true;
      }
      return result;
    }
  },
  methods: {
    perScopeChange(value) {
      this.type_attendance = value;
    },
    notTrial(row) {
      let result = true;

      if (row.course_arrange && row.course_arrange.is_trial === 1) {
        return false;
      }

      return result;
    },
    rowClick(row) {
      if (row.review && row.review.is_draft == 0) {
        this.$Message.error("该授课记录已点评，请选择其他授课记录");
        return false;
      } else {
        this.currentRow = row;
        this.$emit("on-selected", this.currentRow);
        this.close();
      }
    },
    getAttendanceObject(row) {
      let result = "";
      if (row.lesson_type == 0) {
        if (row.cls != null) {
          result = row.cls.class_name;
        } else {
          result = row.course_arrange.name;
        }
      }
      if (row.lesson_type == 1) {
        result = row.sid;
      }
      return result;
    },
    hook_get_param(params) {
      params.with = "cls,course_arrange,ft_review";
      params.review = "null";
      let search_obj = util.copy(this.search_field);
      for (let o in search_obj) {
        let property = search_obj[o];
        if (o == "int_day") {
          if (property != "," && property.length > 0) {
            params[o] = util.sprintf("[Between,%s]", property.join(","));
          }
        } else if (o == "lesson_type") {
          if (property != "," && property.length > 0) {
            params[o] = util.sprintf("[In,%s]", property.join(","));
          }
        } else {
          if (property) {
            params[o] = property;
          }
        }
      }
      if (this.type_attendance == "my") {
        params.eid = this.eid$;
      }
    },
    resetSearch() {
      this.$r("ref_search").resetFields();
      this.init_data();
    }
  }
};
</script>

<style>
</style>