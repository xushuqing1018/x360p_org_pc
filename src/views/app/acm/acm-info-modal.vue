<style>
.ivu-select-dropdown {
  z-index: 9999 !important;
}
</style>
<template>
  <Modal
    v-drag-modal
    :mask-closable="false"
    width="650"
    v-model="modal$.show"
    :title="modal$.title"
  >
    <Form :model="info" label-position="right" :label-width="100" :rules="rules" class="row">
      <Form-item label="分类：" prop="act_ids" class="col-md-12">
        <Cascader :data="type_list" v-model="act_ids" change-on-select></Cascader>
      </Form-item>
      <FormItem label="标题：" prop="title" class="col-md-12 ivu-form-item-required">
        <Input v-model="info.title" />
      </FormItem>
      <FormItem label="内容：" prop="content" class="col-md-12 ivu-form-item-required">
        <umeditor v-model="info.content" :config="{autoHeightEnabled:false,initialFrameHeight:200}"></umeditor>
      </FormItem>
      <FormItem label="简介：" prop="desc" class="col-md-12 ivu-form-item-required">
        <Input v-model="info.desc" type="textarea" placeholder="请输入简介" />
      </FormItem>
      <FormItem label="作者：" prop="author" class="col-md-12 ivu-form-item-required">
        <Input v-model="info.author" />
      </FormItem>
      <FormItem label="推荐：" class="col-md-6">
        <RadioGroup v-model="info.is_recommend">
          <Radio :label="0">否</Radio>
          <Radio :label="1">是</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="阅读数：" prop="views" class="col-md-6">
        <InputNumber :min="0" v-model="info.views"></InputNumber>
      </FormItem>
      <FormItem label="显示状态：" prop="status" v-if="modal$.action == 'edit'" class="col-md-12">
        <Select v-model="info.status" style="width:300px">
          <Option :value="0">不显示</Option>
          <Option :value="1">显示</Option>
        </Select>
      </FormItem>
      <FormItem label="封面图：" prop="cover_img_url" class="col-md-12 ivu-form-item-required">
        <div class="img-upload">
          <div class="img-thumb" style="width: 159px;height: 88px;line-height: 88px;">
            <Icon
              type="camera"
              size="30"
              v-if="info.cover_img_url == ''"
              style="line-height: inherit;"
            ></Icon>
            <img
              class="cursor"
              :src="info.cover_img_url"
              @click="picturePreview(info.cover_img_url)"
              v-else
            />
          </div>
        </div>
        <c-upload v-model="info.cover_img_url" btn-text="上传"></c-upload>
      </FormItem>

      <FormItem label="视频链接：" class="col-md-12 ivu-form-item-required" v-if="is_disabled">
        <Input v-model="info.video_url" placeholder="请输入视频地址">
          <span slot="prepend">流畅版</span>
        </Input>
        <Input v-model="info.video_hq_url" placeholder="请输入视频地址" style="margin-top:5px;">
          <span slot="prepend">清晰版</span>
        </Input>
      </FormItem>
    </Form>
    <div slot="footer">
      <Button type="ghost" @click="close">关闭</Button>
      <Button type="primary" :loading="saving" @click="save()">提交</Button>
    </div>
  </Modal>
</template>                      
<script>
import util from "@/libs/util";
import grid from "@/libs/grid.mixin";
import modal from "@/libs/modal.mixin";
import common from "@/libs/common.mixin";

import cUpload from "c%/cUpload.vue";
import Umeditor from "c%/Umeditor";

const emptyObject = {
  title: "",
  author: "",
  desc: "",
  act_id: 0,
  cover_img_url: "",
  video_url: "",
  video_hq_url: "",
  is_recommend: 0,
  views: 0,
  content: ""
};

export default {
  mixins: [grid, modal, common],
  components: {
    cUpload,
    Umeditor
  },
  data() {
    return {
      showCourseFile: false,
      info: util.copy(emptyObject),
      rules: {
        act_ids: [
          {
            required: true,
            type: "number",
            message: "请选择类别",
            trigger: "blur"
          }
        ]
      },
      upload_percent: 0,
      type_list: [],
      item: {},
      act_ids: [],
      cate_name_list: [],
      is_disabled: 1
    };
  },
  mounted() {},
  watch: {
    "modal$.action": function(val) {
      if (val == "edit") {
        this.info = this.item;
        this.info.status = 1;
        this.is_disabled = this.item.content_type;
        let dataArray = [];

        this.type_list.forEach(f => {
          dataArray.push(f);
          f.children.forEach(s => {
            dataArray.push(s);
            s.children.forEach(t => {
              dataArray.push(t);
            });
          });
        });

        let value = [];
        dataArray.forEach(item => {
          if (
            item.hasOwnProperty("__value") &&
            item.value == this.info.act_id
          ) {
            if (item.__value.length > 2) {
              item.__value.split(",").forEach(i => {
                value.push(Number(i));
              });
            } else {
              value.push(item.__value);
            }
          }
          if (
            !item.hasOwnProperty("__value") &&
            item.value == this.info.act_id
          ) {
            if (item.value.length > 2) {
              item.value.split(",").forEach(i => {
                value.push(Number(i));
              });
            } else {
              value.push(item.value);
            }
          }
        });

        this.act_ids = value;
      }
    },
    act_ids: function(val) {
      let value = val.slice(-1)[0];
      this.info.act_id = value;
      if (value !== 0) {
        let empArray = [];
        this.cate_name_list.forEach(i => {
          empArray.push(i);
        });
        this.cate_name_list.forEach(i => {
          if (i.length !== 0) {
            i.children_level.forEach(l => {
              empArray.push(l);
            });
          }
        });
        this.cate_name_list.forEach(i => {
          i.children_level.forEach(l => {
            l.children_level.forEach(item => {
              empArray.push(item);
            });
          });
        });
        empArray.forEach(item => {
          if (item.act_id == val) {
            this.info.content_type = item.content_type;
            this.is_disabled = item.content_type;
          }
        });
      }
    }
  },
  methods: {
    save() {
      if (this.info.title == "") {
        this.$Message.info("标题不能为空");
        return false;
      }
      if (this.info.act_id == 0 && this.modal$.action == "add") {
        this.$Message.info("请选择分类");
        return false;
      }
      if (this.info.author == "") {
        this.$Message.info("作者名称不能为空");
        return false;
      }
      if (this.info.desc == "") {
        this.$Message.info("简介不能为空");
        return false;
      }
      if (this.info.cover_img_url == "") {
        this.$Message.info("封面图不能为空");
        return false;
      }
      if (this.info.video_url == "" && this.is_disabled) {
        this.$Message.info("流畅视频不能为空");
        return false;
      }
      if (this.info.video_hq_url == "" && this.is_disabled) {
        this.$Message.info("清晰视频不能为空");
        return false;
      }

      let method = this.modal$.action == "add" ? "post" : "put";
      let action = this.modal$.action == "add" ? "添加" : "编辑";
      let $rest = this.$rest("acm_contents");
      if (this.modal$.action != "add") {
        $rest.add_url_param(this.item.ac_id);
      }
      $rest[method](this.info)
        .success(response => {
          this.$Message.success(util.sprintf("%s成功!", action));
          this.$emit("on-success");
          this.close();
        })
        .error(response => {
          this.error(response.body.message);
        });
    }
  }
};
</script>