<template>
  <Modal
    v-drag-modal
    :mask-closable="false"
    width="450"
    v-model="modal$.show"
    :title="modal$.title"
  >
	
    <Form ref="form" :label-width="100" :model="info">
      <Form-item :label="'学管师'|translate">
        <select-employee v-model="info.eid" :rid="4" clearable v-if="!enable_multi_eid"></select-employee>
        <select-employee v-model="info.eids" :rid="4" clearable v-if="enable_multi_eid"></select-employee>
      </Form-item>
    </Form>
    <div slot="footer">
      <Button type="ghost" @click="close" :disabled="saving">取消</Button>
      <Button type="primary" @click="ok" :loading="saving">确认</Button>
    </div>
  </Modal>
</template>

<script>
import modal from "@/libs/modal.mixin";
import common from "@/libs/common.mixin";
import SelectEmployee from "c%/SelectEmployee.vue";

export default {
  mixins: [modal, common],
  components: {
    SelectEmployee
  },
  data() {
    return {
      info: {
      }
    };
  },
  methods: {
    ok() {
      let post = {};
	  let role_name = this.$filter("translate")("学管师");
	  post.sids = []
      post.sids.push(this.info.sid);
	
      if (this.enable_multi_eid) {
        
        if (this.info.eids.length == 0) {
          this.$Message.error("还没有选择" + role_name);
          return false;
		}
		post.eids = this.info.eids;
      } else {
        if (this.info.eid == 0) {
          this.$Message.error("还没有选择" + role_name);
          return false;
		}
		post.eid = this.info.eid;
      }
      this.$rest("employee_students")
        .post(post)
        .success(res => {
          this.$Message.success("分配成功");
          this.$emit("on-success");
          this.close();
        })
        .error(res => {
          this.error(res.body.message);
        });
    }
  }
}
</script>
