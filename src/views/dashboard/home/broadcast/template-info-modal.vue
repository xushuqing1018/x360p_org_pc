<template>
  <Modal
    v-drag-modal
    v-model="modal$.show"
    :title="modal$.title"
    width="700"
    :mask-closable="false"
    class="broadcastpl-modal"
  >
    <Form ref="form" :label-width="80" :model="info">
      <Form-item label="模板名称" prop="name" class="ivu-form-item-required">
        <Input v-model="info.name" placeholder="请输入"></Input>
      </Form-item>
      <Form-item label="公告封面" prop="cover_image_url" class="ivu-form-item-required">
        <div class="img-upload">
          <div class="img-thumb" style="width: 159px;height: 88px;line-height: 88px;">
            <Icon
              type="camera"
              size="30"
              v-if="info.cover_image_url == ''"
              style="line-height: inherit;"
            ></Icon>
            <img
              class="cursor"
              :src="info.cover_image_url"
              @click="picturePreview(info.cover_image_url)"
              v-else
            />
          </div>
        </div>
		<c-upload v-model="info.cover_image_url" btn-text="上传"></c-upload>
      </Form-item>
      <Form-item label="内容" prop="html" class="ivu-form-item-required">
        <umeditor v-model="info.html" :config="{autoHeightEnabled:false,initialFrameHeight:318}"></umeditor>
      </Form-item>
    </Form>
    <div slot="footer">
      <Button type="ghost" @click="close">取消</Button>
      <Button type="primary" @click="previewTpl">预览</Button>
      <Button type="primary" :loading="saving" @click="ok">确定</Button>
    </div>
    <div class="modal-mask" v-if="preview">
      <div class="preview-box">
        <div class="content">
          <p class="header">{{info.name}}</p>
          <p class="date">{{now_date}}</p>
          <p class="desc" v-html="info.html"></p>
        </div>
      </div>
      <Icon type="close" @click.native="closePreview"></Icon>
    </div>
  </Modal>
</template>

<script>
import moment from "moment";
import util from "@/libs/util";
import common from "@/libs/common.mixin";
import modal from "@/libs/modal.mixin";
import grid from "@/libs/grid.mixin";
import cUpload from "c%/cUpload.vue";
import Umeditor from "c%/Umeditor";

const emptyObject = {
  name: "",
  cover_image_url: "",
  html: ""
};

export default {
  mixins: [grid, modal, common],
  components: {
    cUpload,
    Umeditor
  },
  data() {
    return {
      preview: false,
      now_date: moment().format("YYYY-MM-DD"),
      info: util.copy(emptyObject)
    };
  },
  methods: {
    previewTpl() {
      this.preview = true;
    },
    closePreview() {
      this.preview = false;
    },
    ok() {
      if (this.info.name == "") {
        this.$Message.error("模板名称不能为空");
        return;
      }
      if (this.info.cover_image_url == "") {
        this.$Message.error("模板封面不能为空");
        return;
      }
      if (this.info.html == "") {
        this.$Message.error("编辑器内容不能为空");
        return;
      }
      let action = this.modal$.action,
        [method, uri, msg] =
          action == "add"
            ? ["post", "broadcast_tpls", "添加成功"]
            : ["put", "broadcast_tpls/" + this.info.bt_id, "编辑成功"];
      this.$rest(uri)
        [method](this.info)
        .success(data => {
          this.$Message.success(msg);
          this.$emit("on-success");
          this.close();
        })
        .error(res => {
          this.$Notice.error({
            title: "失败",
            desc: res.body.message
          });
        });
    }
  }
};
</script>
<style lang="less" scoped>
.img-thumb img {
  width: 100%;
  height: 100%;
  border: none;
}
.broadcastpl-modal {
  position: relative;
  .modal-mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 10000;
    .preview-box {
      position: absolute;
      top: 50%;
      left: 50%;
      margin-left: -160px;
      margin-top: -370px;
      width: 320px;
      height: 100%;
      background: url(http://sp1.xiao360.com/static/img/phone.png) no-repeat 50%;
      background-size: 100%;
      padding: 150px 28px 110px 28px;
      .content {
        width: 100%;
        height: 475px;
        overflow: auto;
        &::-webkit-scrollbar {
          display: none;
        }
        *::-webkit-scrollbar {
          display: none;
        }
      }
      .header {
        font-size: 18px;
        font-weight: 600;
      }
      .date {
        font-size: 12px;
        color: #999;
      }
      .desc {
        p {
          white-space: normal !important;
          width: auto !important;
        }
        img {
          max-width: 100%;
        }
      }
    }
    .ivu-icon-close {
      position: absolute;
      font-size: 40px;
      top: 20px;
      left: 50%;
      margin-left: -15px;
      color: #fff;
    }
  }
}
</style>