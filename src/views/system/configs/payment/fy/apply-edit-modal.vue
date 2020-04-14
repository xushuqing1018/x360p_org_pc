<style scoped>
.overhide {
  overflow-y: scroll;
  height: 400px !important;
}

.aplay-wrap {
  height: 300px;
  text-align: center;
}
</style>

<template>
  <Modal
    v-drag-modal
    v-model="modal$.show"
    :title="modal$.title"
    :width="750"
    :mask-closable="false"
  >
    <div v-if="!hasAplay" class="aplay-wrap">
      <div style="font-weight:bold;margin-top:140px;line-height:30px;">
        亲，你还没有申请过~
        <br />
        <Button type="primary" icon="plus" @click="addFyInfo">立即申请</Button>
      </div>
    </div>
    <div v-else>
      <Steps :current="currentStep" style="margin-top:20px">
        <Step title="已提交审核"></Step>
        <Step title="系统已驳回" v-if="isBack" status="error"></Step>
        <Step title="已重新提交" v-if="isAgain"></Step>
        <Step title="系统审核通过" v-if="!isBack && !isAgain"></Step>
        <Step title="富友支付审核中" v-if="!isfyBack"></Step>
        <Step title="富友支付审核驳回" v-if="isfyBack" status="error"></Step>
        <Step title="审核成功" status="finish"></Step>
      </Steps>
      <div
        style="color:#f30;margin-top: 10px;"
        v-if="isBack||isfyBack"
      >驳回原因：{{info.client_apply_fy_check[info.client_apply_fy_check.length - 1].check_messages}}</div>
      <Form ref="form" :model="info" :label-width="100" :rules="rules" class="fy-form">
        <Form-item prop="ins_cd">
          <span slot="label" class="pb-2 d-inline-block" v-help="'必填'">机构号</span>
          <Input v-model="info.ins_cd" placeholder="机构号,接入机构在富友的唯一代码" :readonly="!isEdit"></Input>
        </Form-item>

        <Form-item prop="sub_ins_cd">
          <Input
            v-model="info.sub_ins_cd"
            placeholder="二级代理机构号(若无二级代理或不知此字段意思可直接不传"
            :readonly="!isEdit"
          ></Input>
        </Form-item>

        <Form-item label="证件类型" prop="license_type" class="col-sm-6">
          <RadioGroup v-model="info.license_type">
            <Radio :label="0">企业商户（营业执照）</Radio>
            <Radio :label="1">企业商户（三证合一）</Radio>
            <Radio :label="2">事业单位</Radio>
            <Radio :label="A">小微商户</Radio>
            <Radio :label="B">个体工商户</Radio>
          </RadioGroup>
        </Form-item>

        <Form-item prop="mchnt_name">
          <span slot="label" class="pb-2 d-inline-block" v-help="'必填'">商户全称</span>
          <Input
            v-model="info.mchnt_name"
            placeholder="请输入商户全称，不能有特殊字符，仅可包含汉字、数字、字母(需与营业执照一致，如遇提示重复，请在后面加数字1、2...，若为小微商户，请命名为 个体户 xxx。)"
            :readonly="!isEdit"
          ></Input>
        </Form-item>

        <Form-item prop="mchnt_shortname">
          <span slot="label" class="pb-2 d-inline-block" v-help="'必填'">商户简称</span>
          <Input v-model="info.mchnt_shortname" placeholder="请输入富友商户号" :readonly="!isEdit"></Input>
        </Form-item>

        <Form-item prop="real_name">
          <span slot="label" class="pb-2 d-inline-block" v-help="'必填'">商户真实名称</span>
          <Input v-model="info.real_name" placeholder="商户真实名称(与营业执照上相同)" :readonly="!isEdit"></Input>
        </Form-item>

        <Form-item prop="license_no">
          <span slot="label" class="pb-2 d-inline-block" v-help="'必填'">证件号码</span>
          <Input v-model="info.license_no" :placeholder="init_license_no_pla" :readonly="!isEdit"></Input>
        </Form-item>
        <Form-item prop="license_expire_dt">
          <span slot="label" class="pb-2 d-inline-block" v-help="'必填'">证件到期日</span>
          <Input
            v-model="info.license_expire_dt"
            :placeholder="init_license_expire_dt_pla"
            :readonly="!isEdit"
          ></Input>
        </Form-item>
        <Form-item prop="certif_id">
          <span slot="label" class="pb-2 d-inline-block" v-help="'必填'">法人身份证号</span>
          <Input v-model="info.certif_id" placeholder="请输入法人身份证号" :readonly="!isEdit"></Input>
        </Form-item>
        <Form-item prop="certif_id_expire_dt">
          <span slot="label" class="pb-2 d-inline-block" v-help="'必填'">法人身份证到期日</span>
          <Input
            v-model="info.certif_id_expire_dt"
            placeholder="请输入法人身份证到期日 （格式 YYYYMMDD）"
            :readonly="!isEdit"
          ></Input>
        </Form-item>
        <Form-item prop="contact_person">
          <span slot="label" class="pb-2 d-inline-block" v-help="'必填'">联系人姓名</span>
          <Input v-model="info.contact_person" placeholder="请输入联系人姓名（不能有特殊字符）" :readonly="!isEdit"></Input>
        </Form-item>
        <Form-item prop="contact_phone">
          <span slot="label" class="pb-2 d-inline-block" v-help="'必填'">客服电话</span>
          <Input v-model="info.contact_phone" placeholder="请输入客服电话" :readonly="!isEdit"></Input>
        </Form-item>
        <Form-item prop="contact_addr">
          <span slot="label" class="pb-2 d-inline-block" v-help="'必填'">联系地址</span>
          <Input v-model="info.contact_addr" placeholder="请输入联系地址" :readonly="!isEdit"></Input>
        </Form-item>
        <Form-item prop="contact_mobile">
          <span slot="label" class="pb-2 d-inline-block" v-help="'必填'">联系电话</span>
          <Input v-model="info.contact_mobile" placeholder="请输入联系电话" :readonly="!isEdit"></Input>
        </Form-item>
        <Form-item prop="contact_email">
          <span slot="label" class="pb-2 d-inline-block" v-help="'必填'">联系邮箱</span>
          <Input v-model="info.contact_email" placeholder="请输入联系邮箱" :readonly="!isEdit"></Input>
        </Form-item>
        <Form-item prop="business">
          <span slot="label" class="pb-2 d-inline-block" v-help="'必填'">经营范围代码</span>
          <Input
            v-model="info.business"
            placeholder="请输入经营范围代码，不知道可以填超市代码(204)"
            :readonly="!isEdit"
          ></Input>
        </Form-item>

        <Form-item label="行政区划" prop="areas_list" placeholder="请选择省市县">
          <Cascader :data="info.fy_info" :value.sync="value2"></Cascader>
        </Form-item>

        <!-- <Form-item  prop="province_cd">
							<span slot="label" class="pb-2 d-inline-block" v-help="'必填'">所属行政区划</span>
							<Input v-model="info.province_cd" placeholder="请输入富友商户号"></Input>
						</Form-item>
						<Form-item  prop="city_cd">
							<span slot="label" class="pb-2 d-inline-block" v-help="'必填'">所属行政区划</span>
							<Input v-model="info.city_cd" placeholder="请输入富友商户号"></Input>
						</Form-item>
						<Form-item  prop="county_cd">
							<span slot="label" class="pb-2 d-inline-block" v-help="'必填'">证件类型</span>
							<Input v-model="info.county_cd" placeholder="请输入富友商户号"></Input>
        </Form-item>-->

        <Form-item label="入账卡类型" prop="acnt_type">
          <span slot="label" class="pb-2 d-inline-block" v-help="'必填'">入账卡类型</span>
          <RadioGroup v-model="info.acnt_type">
            <Radio :label="1">对公</Radio>
            <Radio :label="2">对公</Radio>
          </RadioGroup>
        </Form-item>

        <Form-item label="行别" prop="bank_type">
          <span slot="label" class="pb-2 d-inline-block" v-help="'必填'" v-if="acnt_type == '1'">行别</span>
          <Select v-model="info.bank_type">
            <Option v-for="item in bank_type" :value="item['code']">{{item['name']}}</Option>
          </Select>
        </Form-item>
        <Form-item prop="inter_bank_no">
          <span slot="label" class="pb-2 d-inline-block" v-help="'必填'">入账卡开户行联行号</span>
          <Input v-model="info.inter_bank_no" placeholder="请输入入账卡开户行联行号" :readonly="!isEdit"></Input>
        </Form-item>
        <Form-item prop="iss_bank_nm">
          <span slot="label" class="pb-2 d-inline-block" v-help="'必填'">入账卡开户行名称</span>
          <Input v-model="info.iss_bank_nm" placeholder="请输入入账卡开户行名称" :readonly="!isEdit"></Input>
        </Form-item>
        <Form-item prop="acnt_nm">
          <span slot="label" class="pb-2 d-inline-block" v-help="'必填'">入账卡户名</span>
          <Input v-model="info.acnt_nm" placeholder="请输入入账卡户名" :readonly="!isEdit"></Input>
        </Form-item>

        <Form-item prop="acnt_no">
          <span slot="label" class="pb-2 d-inline-block" v-help="'必填'">入账卡号</span>
          <Input v-model="info.acnt_no" placeholder="请输入入账卡号" :readonly="!isEdit"></Input>
        </Form-item>
        <!-- TODO: 后台设置语言包，类型 -->
        <Form-item label="清算类型" prop="settle_tp">
          <span slot="label" class="pb-2 d-inline-block" v-help="'必填'">清算类型</span>
          <Select v-model="info.settle_tp" filterable>
            <Option value="1" check="checked">自动结算（T1）</Option>
            <Option value="2">手动结算</Option>
            <Option value="3">自动结算（D1）</Option>
            <Option value="4">定时结算</Option>
          </Select>
        </Form-item>

        <Form-item prop="artif_nm">
          <span slot="label" class="pb-2 d-inline-block" v-help="'必填'">法人姓名</span>
          <Input v-model="info.artif_nm" placeholder="请输入法人姓名" :readonly="!isEdit"></Input>
        </Form-item>
        <Form-item prop="acnt_artif_flag">
          <span slot="label" class="pb-2 d-inline-block" v-help="'必填'">法人入账标识</span>
          <RadioGroup v-model="info.acnt_artif_flag">
            <Radio :label="0">非法人入账</Radio>
            <Radio :label="1">法人入账</Radio>
          </RadioGroup>
        </Form-item>

        <Form-item prop="acnt_certif_tp" placeholder="入账证件类型" :readonly="!isEdit">
          <Select v-model="info.acnt_certif_id" filterable>
            <Option value="0" select="selected">身份证</Option>
          </Select>
        </Form-item>

        <Form-item prop="acnt_certif_id">
          <span slot="label" class="pb-2 d-inline-block" v-help="'必填'">入账证件号</span>
          <Input v-model="info.acnt_certif_id" placeholder="请输入入账证件号" :readonly="!isEdit"></Input>
        </Form-item>

        <Form-item prop="acnt_certif_expire_dt">
          <span slot="label" class="pb-2 d-inline-block" v-help="'必填'">入账证件到期日</span>
          <Input v-model="info.acnt_certif_expire_dt" placeholder="请输入入账证件到期日" :readonly="!isEdit"></Input>
        </Form-item>

        <Form-item prop="th_flag" label="退货标识">
          <RadioGroup v-model="info.th_flag">
            <Radio label="0">不能退货</Radio>
            <Radio label="1">可以退货</Radio>
          </RadioGroup>
        </Form-item>

        <Form-item prop="wx_busi_flag" label="微信业务标识">
          <RadioGroup v-model="info.wx_busi_flag">
            <Radio label="0">微信一般类</Radio>
          </RadioGroup>
        </Form-item>

        <Form-item prop="wx_flag" label="微信支付标识">
          <RadioGroup v-model="info.wx_flag">
            <Radio label="0">不开通</Radio>
            <Radio label="1">开通</Radio>
          </RadioGroup>
        </Form-item>

        <Form-item prop="wx_set_cd" placeholder="开通微信支付时必填，不开通可以不填">
          <!-- TODO:统一按照0.38%计算，到后台找 -->
          <Input v-model="info.wx_set_cd" placeholder="请输入微信扣率套餐代码" :readonly="!isEdit"></Input>
        </Form-item>

        <Form-item prop="ali_flag" label="微信支付标识">
          <RadioGroup v-model="info.ali_flag">
            <Radio label="0">不开通</Radio>
            <Radio label="1">开通</Radio>
          </RadioGroup>
        </Form-item>

        <Form-item prop="ali_set_cd" placeholder="开通支付宝支付时必填，不开通可以不填">
          <!-- TODO:统一按照0.38%计算，到后台找 -->
          <Input v-model="info.ali_set_cd" placeholder="请输入支付宝扣率套餐代码" :readonly="!isEdit"></Input>
        </Form-item>

        <Form-item prop="contact_cert_no" placeholder="联系人身份证号">
          <Input
            v-model="info.contact_cert_no"
            placeholder="请输入联系人身份证号(新店开始时间在,9月10日后必填)"
            :readonly="!isEdit"
          ></Input>
        </Form-item>
        <Form-item prop="license_start_dt" placeholder="营业执照开始时间">
          <Input
            v-model="info.license_start_dt"
            placeholder="小微商户可不填，其他商户类型必填(新店开始时间在,9月10日后必填)"
            :readonly="!isEdit"
          ></Input>
        </Form-item>
        <Form-item prop="lic_regis_addr" placeholder="营业执照注册地址">
          <Input
            v-model="info.lic_regis_addr"
            placeholder="小微商户可不填，其他商户类型必填(新店开始时间在,9月10日后必填)"
            :readonly="!isEdit"
          ></Input>
        </Form-item>
        <Form-item prop="card_start_dt" placeholder="法人身份证开始时间">
          <Input
            v-model="info.card_start_dt"
            placeholder="小微商户可不填，其他商户类型必填(新店开始时间在,9月10日后必填)"
            :readonly="!isEdit"
          ></Input>
        </Form-item>
      </Form>
    </div>
    <div slot="footer">
      <Button type="ghost" @click="close">关闭</Button>
      <Button type="primary" @click="ok" v-if="hasAplay&&isBack" icon="edit">重新提交</Button>
      <Button
        type="primary"
        @click="fyOk"
        v-if="hasAplay&&info.is_audit == 1&&info.is_check == 1"
        icon="edit"
      >重新提交</Button>
      <Button
        type="primary"
        v-if="hasAplay&&info.is_audit == 0&&info.is_check == 0"
        icon="more"
        disabled
      >正在审核</Button>
    </div>
  </Modal>
</template>

<script>
import util from "@/libs/util";
import common from "@/libs/common.mixin";
import modal from "@/libs/modal.mixin";
import globals from "@/libs/globals.mixin";

const INFO_NAME = "富友支付申请";
const INFO_PK_ID = "caf_id";
const INFO_URL = "fu_yous";

const emptyObject = {
  is_audit: 0,
  is_check: 0,
  client_apply_fy_check: [],
  ins_cd: "",
  sub_ins_cd: "",
  mchnt_name: "",
  mchnt_shortname: "",
  real_name: "",
  license_type: "",
  license_no: "",
  license_expire_dt: "",
  certif_id: "",
  certif_id_expire_dt: "",
  contact_person: "",
  contact_phone: "",
  contact_addr: "",
  contact_mobile: "",
  contact_email: "",
  business: "204",
  province_cd: "",
  city_cd: "",
  county_cd: "",
  acnt_type: "",
  bank_type: [],
  inter_bank_no: "",
  iss_bank_nm: "",
  acnt_nm: "",
  acnt_no: "",
  settle_tp: "",
  artif_nm: "",
  acnt_artif_flag: "",
  acnt_certif_tp: "",
  acnt_certif_id: "",
  acnt_certif_expire_dt: "",
  th_flag: "",
  wx_busi_flag: "0",
  wx_flag: "",
  wx_set_cd: "",
  ali_flag: "",
  ali_set_cd: "",
  contact_cert_no: "",
  license_start_dt: "",
  lic_regis_addr: "",
  card_start_dt: "",
  areas_list: [],
  create_account: true
};

export default {
  mixins: [common, modal, globals],
  data() {
    return {
      hasAplay: false,
      fy_areas: [],
      info: util.copy(emptyObject),
      areas_list: "",
      rules: {
        ins_cd: [{ required: true, message: "", trigger: "blur" }],
        mchnt_name: [{ required: true, message: "", trigger: "blur" }],
        mchnt_shortname: [{ required: true, message: "", trigger: "blur" }],
        real_name: [{ required: true, message: "", trigger: "blur" }],
        license_type: [{ required: true, message: "", trigger: "blur" }],
        license_no: [{ required: true, message: "", trigger: "change" }],
        license_expire_dt: [{ required: true, message: "", trigger: "blur" }],
        certif_id: [{ required: true, message: "", trigger: "change" }],
        certif_id_expire_dt: [{ required: true, message: "", trigger: "blur" }],
        contact_person: [{ required: true, message: "", trigger: "blur" }],
        contact_phone: [{ required: true, message: "", trigger: "change" }],
        contact_addr: [{ required: true, message: "", trigger: "blur" }],
        contact_mobile: [{ required: true, message: "", trigger: "blur" }],
        contact_email: [{ required: true, message: "", trigger: "change" }],
        business: [{ required: true, message: "", trigger: "blur" }],
        areas_list: [
          { required: true, type: "array", message: "", trigger: "blur" }
        ],
        // city_cd: [
        // 	{ required: true, message: '', trigger: 'blur' }
        // ],
        // county_cd: [
        // 	{ required: true, message: '', trigger: 'blur' }
        // ],
        // areas_list: [
        //   { required: true, type: "array", message: "", trigger: "blur" }
        // ],
        acnt_type: [{ required: true, message: "", trigger: "blur" }],
        bank_type: [{ required: true, message: "", trigger: "blur" }],
        inter_bank_no: [{ required: true, message: "", trigger: "blur" }],
        iss_bank_nm: [{ required: true, message: "", trigger: "blur" }],
        acnt_nm: [{ required: true, message: "", trigger: "blur" }],
        acnt_no: [{ required: true, message: "", trigger: "blur" }],
        settle_tp: [{ required: true, message: "", trigger: "blur" }],
        artif_nm: [{ required: true, message: "", trigger: "blur" }],
        acnt_artif_flag: [{ required: true, message: "", trigger: "blur" }],
        acnt_certif_tp: [{ required: true, message: "", trigger: "blur" }],
        acnt_certif_id: [{ required: true, message: "", trigger: "blur" }],

        th_flag: [{ required: true, message: "", trigger: "blur" }],

        wx_flag: [{ required: true, message: "", trigger: "blur" }],

        ali_flag: [{ required: true, message: "", trigger: "blur" }]
      }
    };
  },
  mounted() {
    //this.modal$.action=='edit';
    // this.init_all_provinces();
  },
  watch: {
    "modal$.show": function(val) {
      // if(val && this.modal$.action=='edit') {
      // 	this.get_branch_list();
      // }
      this.areas_list = this.info.areas_list;
    }
  },
  methods: {
    // 打开新页面申请
    addFyInfo() {
      this.$Modal
        .open("system/configs/payment/fy/apply-add-modal.vue", {
          on: {
            save: () => {
              this.getFyInfo();
            }
          }
        })
        .then(modal => {
          modal.show("提交富友支付申请", "add");
        });
    },
    getFyInfo() {
      this.info = [];
      this.$rest("fu_yous")
        .get()
        .success(res => {
          if (res.list.length != 0) {
            this.info = res.list[0];
          }
        })
        .error(res => {
          this.$Message.error(res.body.message);
        });
    },

    // 原页面编辑
    // TODO:优化性能设置，避免一次性加载过多数据造成，卡顿
    // init_all_provinces() {
    // 	this.$rest('fu_yous/get_area')
    // 	.get()
    // 	.success(res => {
    // 		this.fy_areas = this.res
    // 	})
    // 	.error(res => {
    // 		this.$Message.error(res.body.message)
    // 	})
    // },
    // get_branch_list(value) {
    // 	let bank_area = ''
    // 	if(value && value.length==3) {
    // 		bank_area = value[2]
    // 	}else{
    // 		if(this.info.bank_area) {
    // 			bank_area = this.info.bank_area
    // 		}
    // 	}
    // 	if(this.info.bank_name&&bank_area) {
    // 		this.$rest('fu_yous/get_branchs')
    // 		.get({
    // 			bank_name: this.info.bank_name,
    // 			bank_area: bank_area
    // 		})
    // 		.success(res => {
    // 			this.branch_list = res.biz_response.data
    // 		})
    // 		.error(res => {
    // 			this.$Message.error(res.body.message)
    // 		})
    // 	}
    // },
    // get_bank_name() {
    // 	if(this.info.bank_card) {
    // 		this.$rest('fu_yous/get_bank')
    // 		.get({
    // 			bank_card: this.info.bank_card
    // 		})
    // 		.success(res => {
    // 			this.info.bank_name = res.biz_response.data
    // 			this.get_branch_list()
    // 		})
    // 		.error(res => {
    // 			this.$Message.error(res.body.message)
    // 		})
    // 	}else{
    // 		this.$Message.error('请输入银行卡号')
    // 	}
    // },
    // handleUploadSuccess1 (res, file) {
    // 	this.info.bank_card_image = res.data.biz_response.data
    // },
    // handleUploadSuccess2 (res, file) {
    // 	this.info.holder_id_front_photo = res.data.biz_response.data
    // },
    // handleUploadSuccess3 (res, file) {
    // 	this.info.holder_id_back_photo = res.data.biz_response.data
    // },
    // handleUploadSuccess4 (res, file) {
    // 	this.info.brand_photo = res.data.biz_response.data
    // },
    // handleUploadSuccess5 (res, file) {
    // 	this.info.indoor_photo = res.data.biz_response.data
    // },
    // handleUploadSuccess6 (res, file) {
    // 	this.info.outdoor_photo = res.data.biz_response.data
    // },
    // handleUploadSuccess7 (res, file) {
    // 	this.info.other_photos = res.data.biz_response.data
    // },
    // handleUploadSuccess8 (res, file) {
    // 	this.info.business_license_photo = res.data.biz_response.data
    // },
    // handleUploadBefore(file){
    // 	this.upload_percent = 0
    // },
    // handleUploadError (file) {
    //     this.$Notice.warning({
    //         title: '文件格式不正确',
    //         desc: '文件 ' + file.name + ' 格式不正确，请上传 jpg 或 png 格式的图片。'
    //     });
    // },
    // handleUploadProgress(event,file,filelist){
    // 	this.upload_percent = event.percent
    // },
    ok() {
      // let images = [
      // 	['bank_card_image','银行卡照片'],
      // 	['business_license_photo','营业执照'],
      // 	['holder_id_front_photo','身份证正面照'],
      // 	['holder_id_back_photo','身份证反面照'],
      // 	['brand_photo','门头照片'],
      // 	['indoor_photo','室内照片'],
      // 	['outdoor_photo','室外照片'],
      // 	]
      // for(let i in images){
      // 	if(this.info[images[i][0]]==='') {
      // 		this.$Message.error('请上传'+images[i][1])
      // 		return;
      // 	}
      // }
      this.save();
    },
    fyOk() {
      this.$rest("fu_yous")
        .put(this.info)
        .success(res => {
          this.$Message.success("提交成功！");
          this.close();
        })
        .error(res => {
          this.error(res.body.message);
        });
    }
  },
  computed: {
    isEdit() {
      var is_audit = this.info.is_audit;
      var is_check = this.info.is_check;
      if (is_audit == 0 && is_check == 1) {
        return true;
      } else if (is_audit == 1 && is_check == 1) {
        return true;
      }
      return false;
    },
    isBack() {
      var is_audit = this.info.is_audit;
      var is_check = this.info.is_check;
      if (is_audit == 0 && is_check == 1) {
        return true;
      }
      return false;
    },
    isfyBack() {
      var is_audit = this.info.is_audit;
      var is_check = this.info.is_check;
      if (is_audit == 1 && is_check == 1) {
        return true;
      }
      return false;
    },
    isAgain() {
      var is_audit = this.info.is_audit; // 是否审核通过
      var is_check = this.info.is_check; // 是否审核
      if (
        is_audit == 0 &&
        is_check == 0 &&
        this.info.client_apply_fy_check.length > 1
      ) {
        return true;
      }
      return false;
    },
    currentStep() {
      var stepIndex = 0;
      var is_audit = this.info.is_audit;
      var is_check = this.info.is_check;
      if (is_audit == 0 && is_check == 0) {
        if (this.info.client_apply_fy_check.length == 1) {
          stepIndex = 0;
        } else {
          stepIndex = 1;
        }
      } else if (is_audit == 0 && is_check == 1) {
        stepIndex = 1;
      } else if (is_audit == 1 && is_check == 0) {
        stepIndex = 2;
      } else if (is_audit == 1 && is_check == 1) {
        stepIndex = 2;
      } else if (is_audit == 2) {
        stepIndex = 2;
      }
      return stepIndex;
    },
    // bank_area:{
    //     get:function(){
    //         return this.info.bank_area_arr
    //     },
    //     set:function(value){
    //         this.info.bank_area = value[2]
    //         this.info.bank_area_arr = value
    //     }
    // },
    // area:{
    //     get:function(){
    //         return this.info.area_arr
    //     },
    //     set:function(value){
    //         this.info.area = value[2]
    //         this.info.area_arr = value
    //     }
    // },
    // upload_header(){
    //     return {
    //         'x-token':this.$store.state.user.token,
    //         'x-file-key':'file'
    //     }
    // },
    info_url$() {
      return INFO_URL;
    },
    info_name$() {
      return INFO_NAME;
    },
    info_pk_id$() {
      return INFO_PK_ID;
    }
  }
};
</script>

<style lang="less" scoped>
.fy-form {
  .ivu-form-item-error-tip {
    display: none;
  }
}

.fy-form {
  margin-top: 30px;
}
</style>