<template>
  <Modal
    v-drag-modal
    v-model="modal$.show"
    :title="modal$.title"
    :width="800"
    :height="600"
    :mask-closable="false"
  >
    <Form
      ref="form"
      :model="info"
      :label-width="100"
      :rules="rules"
      class="fy-form"
      style="/*height:600px;overflow:auto;*/"
    >
      <Form-item prop="ins_cd" label="机构号">
        <Input v-model="info.ins_cd" placeholder="机构号,接入机构在富友的唯一代码"></Input>
      </Form-item>

      <Form-item prop="sub_ins_cd" label="二级代理机构号">
        <Input v-model="info.sub_ins_cd" placeholder="二级代理机构号(若无二级代理可直接不传)"></Input>
      </Form-item>

      <Form-item label="证件类型" prop="license_type">
        <RadioGroup v-model="info.license_type">
          <Radio label="0">企业商户（营业执照）</Radio>
          <Radio label="1">企业商户（三证合一）</Radio>
          <Radio label="2">事业单位</Radio>
          <Radio label="A">小微商户</Radio>
          <Radio label="B">个体工商户</Radio>
        </RadioGroup>
      </Form-item>

      <Form-item prop="mchnt_name" label="商户全称">
        <Input
          v-model="info.mchnt_name"
          placeholder="请输入商户全称，不能有特殊字符，仅可包含汉字、数字、字母(需与营业执照一致，如遇提示重复，请在后面加数字1、2...，若为小微商户，请命名为 个体户 xxx。)"
        ></Input>
      </Form-item>

      <Form-item prop="mchnt_shortname" label="商户简称">
        <Input v-model="info.mchnt_shortname" placeholder="请输入富友商户号"></Input>
      </Form-item>

      <Form-item prop="real_name" label="商户真实名称">
        <Input v-model="info.real_name" placeholder="商户真实名称(与营业执照上相同)"></Input>
      </Form-item>

      <Form-item prop="license_no" label="证件号码">
        <Input v-model="info.license_no" :placeholder="init_license_no_pla"></Input>
      </Form-item>
      <Form-item prop="license_expire_dt" label="证件到期日">
        <Input v-model="info.license_expire_dt" :placeholder="init_license_expire_dt_pla"></Input>
      </Form-item>
      <Form-item prop="certif_id" label="法人身份证号">
        <Input v-model="info.certif_id" placeholder="请输入法人身份证号"></Input>
      </Form-item>
      <Form-item prop="certif_id_expire_dt" label="法人身份证到期日">
        <Input v-model="info.certif_id_expire_dt" placeholder="请输入法人身份证到期日 （格式 YYYYMMDD）"></Input>
      </Form-item>
      <Form-item prop="contact_person" label="联系人姓名">
        <Input v-model="info.contact_person" placeholder="请输入联系人姓名（不能有特殊字符）"></Input>
      </Form-item>
      <Form-item prop="contact_phone" label="客服电话">
        <Input v-model="info.contact_phone" placeholder="请输入客服电话"></Input>
      </Form-item>
      <Form-item prop="contact_addr" label="联系地址">
        <Input v-model="info.contact_addr" placeholder="请输入联系地址"></Input>
      </Form-item>
      <Form-item prop="contact_mobile" label="联系电话">
        <Input v-model="info.contact_mobile" placeholder="请输入联系电话"></Input>
      </Form-item>
      <Form-item prop="contact_email" label="联系邮箱">
        <Input v-model="info.contact_email" placeholder="请输入联系邮箱"></Input>
      </Form-item>
      <Form-item prop="business" label="经营范围代码">
        <Input v-model="info.business" placeholder="请输入经营范围代码，不知道可以填超市代码(204)"></Input>
      </Form-item>

      <Form-item label="行政区划" prop="areas_list" placeholder="请选择省市县">
        <template>
          <Cascader
            :data="areas_list"
            :value.sync="info.province_city_country"
            @on-change="getChooseAreaValue"
          ></Cascader>
        </template>
      </Form-item>

      <Form-item label="入账卡类型" prop="acnt_type">
        <RadioGroup v-model="info.acnt_type">
          <Radio :label="1">对公</Radio>
          <Radio :label="2">对公</Radio>
        </RadioGroup>
      </Form-item>

      <Form-item label="行别" prop="bank_type">
        <Select
          v-model="info.bank_type"
          style="width:200px"
          label-in-value="true"
          @on-change="getItemValue"
        >
          <Option
            v-for="item in bank_type_list"
            :value="item.value"
            :key="item.value"
          >{{ item.label }}</Option>
        </Select>
      </Form-item>
      <Form-item label="支行" prop="one_branch">
        <Select v-model="info.one_branch" style="width:200px" @on-change="getOneBranchValue">
          <Option v-for="item in branch_list" :value="item.value" :key="item.value">{{ item.label }}</Option>
        </Select>
      </Form-item>

      <Form-item prop="inter_bank_no" label="开户行联行号" placeholder="请输入入账卡开户行联行号">
        <Input v-model="info.inter_bank_no" readonly="readonly"></Input>
      </Form-item>
      <Form-item prop="iss_bank_nm" label="开户行名称" placeholder="请输入入账卡开户行名称">
        <Input v-model="info.iss_bank_nm" readonly="readonly"></Input>
      </Form-item>
      <Form-item prop="acnt_nm" label="户名">
        <Input v-model="info.acnt_nm" placeholder="请输入入账卡户名"></Input>
      </Form-item>

      <Form-item prop="acnt_no" label="卡号">
        <Input v-model="info.acnt_no" placeholder="请输入入账卡号"></Input>
      </Form-item>
      <!-- TODO: 后台设置语言包，类型 -->
      <Form-item label="清算类型" prop="settle_tp">
        <Select v-model="info.settle_tp" filterable>
          <!-- <Option value="">请选择</!-->
          -->
          <Option selected="selected">请选择</Option>
          <Option value="1">自动结算（T1）</Option>
          <Option value="2">手动结算</Option>
          <Option value="3">自动结算（D1）</Option>
          <Option value="4">定时结算</Option>
        </Select>
      </Form-item>

      <Form-item prop="artif_nm" label="法人姓名">
        <Input v-model="info.artif_nm" placeholder="请输入法人姓名"></Input>
      </Form-item>
      <Form-item prop="acnt_artif_flag" label="法人入账标识">
        <RadioGroup v-model="info.acnt_artif_flag">
          <Radio :label="0">非法人入账</Radio>
          <Radio :label="1">法人入账</Radio>
        </RadioGroup>
      </Form-item>

      <Form-item prop="acnt_certif_tp" placeholder="请选择入账证件类型" label="入账证件类型">
        <Select v-model="info.acnt_certif_tp" filterable>
          <Option value="0" select="selected">身份证</Option>
        </Select>
      </Form-item>

      <Form-item prop="acnt_certif_id" label="入账证件号">
        <Input v-model="info.acnt_certif_id" placeholder="请输入入账证件号"></Input>
      </Form-item>

      <Form-item prop="acnt_certif_expire_dt" label="入账证件到期日">
        <Input v-model="info.acnt_certif_expire_dt" placeholder="请输入入账证件到期日"></Input>
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

      <Form-item prop="wx_set_cd" label="微信扣率套餐代码">
        <!-- TODO:统一按照0.38%计算，到后台找 -->
        <Input v-model="info.wx_set_cd" placeholder="请输入微信扣率套餐代码（开通微信支付时必填，不开通可以不填）"></Input>
      </Form-item>

      <Form-item prop="ali_flag" label="微信支付标识">
        <RadioGroup v-model="info.ali_flag">
          <Radio label="0">不开通</Radio>
          <Radio label="1">开通</Radio>
        </RadioGroup>
      </Form-item>

      <Form-item prop="ali_set_cd" label="支付宝扣率套餐代码">
        <!-- TODO:统一按照0.38%计算，到后台找 -->
        <Input v-model="info.ali_set_cd" placeholder="请输入支付宝扣率套餐代码（开通支付宝支付时必填，不开通可以不填）"></Input>
      </Form-item>

      <Form-item prop="contact_cert_no" placeholder="请输入联系人身份证号(新店开始时间在,9月10日后必填)" label="联系人身份证号">
        <Input v-model="info.contact_cert_no"></Input>
      </Form-item>
      <Form-item prop="license_start_dt" label="营业执照开始时间">
        <Input v-model="info.license_start_dt" placeholder="小微商户可不填，其他商户类型必填(新店开始时间在,9月10日后必填)"></Input>
      </Form-item>
      <Form-item prop="lic_regis_addr" label="营业执照注册地址">
        <Input v-model="info.lic_regis_addr" placeholder="小微商户可不填，其他商户类型必填(新店开始时间在,9月10日后必填)"></Input>
      </Form-item>
      <Form-item prop="card_start_dt" label="法人身份证开始时间">
        <Input v-model="info.card_start_dt" placeholder="小微商户可不填，其他商户类型必填(新店开始时间在,9月10日后必填)"></Input>
      </Form-item>
    </Form>
    <div slot="footer">
      <Button type="ghost" @click="close">关闭</Button>
      <Button type="primary" @click="ok">确定</Button>
    </div>
  </Modal>
</template>

<script>
import util from "@/libs/util";
import modal from "@/libs/modal.mixin";
import common from "@/libs/common.mixin";
import globals from "@/libs/globals.mixin";

const INFO_NAME = "富友支付申请";
const INFO_PK_ID = "caf_id";
const INFO_URL = "fu_yous";

const emptyObject = {
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
  bank_type: "",
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

  province_city_country: [], // 默认选中值
  one_branch: "", // 默认选中值

  create_account: true
};

export default {
  mixins: [modal, common, globals],
  data() {
    return {
      info: util.copy(emptyObject),
      areas_list: [],
      bank_type_list: [],
      branch_list: [],
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
        province_city_country: [
          { required: true, type: "array", message: "", trigger: "blur" }
        ],
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

        // contact_cert_no: [
        // 	{ required: true, message: '', trigger: 'blur' }
        // ],
        // license_start_dt: [
        // 	{ required: true, message: '', trigger: 'blur' }
        // ],
        // lic_regis_addr: [
        // 	{ required: true, message: '', trigger: 'blur' }
        // ],
        // card_start_dt: [
        // 	{ required: true, message: '', trigger: 'blur' }
        // ],
      }
    };
  },

  mounted() {
    this.init_all_provinces();
    this.init_all_bank_type();
  },
  watch: {
    // "modal$.show": function(val) {
    //   if (val && this.modal$.action == "edit") {
    //     this.get_branch_list();
    //   }
    // }
  },
  methods: {
    init_all_provinces() {
      this.$rest("fu_yous/get_area")
        .get()
        .success(res => {
          // 获取全国所有省市县地址列表
          this.areas_list = res.list;
        })
        .error(res => {
          this.$Message.error(res.body.messsage);
        });
    },
    init_all_bank_type() {
      this.$rest("fu_yous/get_bank")
        .get()
        .success(res => {
          this.bank_type_list = res.list;
        })
        .error(res => {
          this.$Message.error(res.body.message);
        });
    },
    setBranches(city_code, bank_type_code) {
      this.$rest("fu_yous/get_branchs")
        .get({
          bank_type_code: bank_type_code,
          city_code: city_code
        })
        .success(res => {
          this.branch_list = res.list;
        })
        .error(res => {
          this.$Message.error(res.body.message);
        });
    },

    format_province_city_country() {
      if (this.info.province_city_country.length!=0) {
        this.info.province_cd = this.info.province_city_country[0];
        this.info.city_cd = this.info.province_city_country[1];
        this.info.country_cd = this.info.province_city_country[2];
        return;
      } else {
        this.$Message.error("请选择地区");
        return;
      }
    },
    // fix: 级联绑定时，值获取不到
    getChooseAreaValue(e){
      if(e.length[0] == ''){
        this.$Message.error("请选择地区");
        return ;
      }
      console.log(this.info.province_city_country);
      console.log(typeof(this.info.province_city_country));
      this.info.province_city_country.push(e[0],e[1],e[2]); 
      // this.info.province_city_country[e[0],e[1],e[2]];
      this.info.province_cd = e[0];
      this.info.city_cd = e[1];
      this.info.country_cd = e[2];
    },

    getItemValue(e) {
      let bank_type_code = e.value;
      console.log(this.info.province_city_country);
      if (this.info.province_city_country && bank_type_code) {
        this.format_province_city_country();
        let city_code = "";
        if (!this.info.county_cd) {
          city_code = this.info.county_cd;
        } else if (!this.info.city_cd) {
          city_code = this.info.city_cd;
        } else if (!this.info.province_cd) {
          city_code = this.info.province_cd;
        } else {
          return;
        }
        console.log(this.info.province_cd);
        console.log(this.info.city_cd);
        console.log(this.info.county_cd);
        console.log(city_code);

        this.setBranches(city_code, bank_type_code);
      }
    },
    getOneBranchValue(e) {
      this.info.inter_bank_no = e.label;
      this.info.iss_bank_nm = e.name;
    },

    ok() {
      if (
        this.info.license_type == 0 ||
        this.info.license_type == 1 ||
        this.info.license_type == 2 ||
        this.info.license_type == "B"
      ) {
        if (this.info.license_start_dt === "") {
          this.$Message.error("非小微商户，必填 营业执照开始时间");
          return;
        }
      }

      if (this.info.license_type === "A") {
        // 小微商户, 必须是法人入账, 入账证件号为法人身份证，
        this.info.acnt_artif_flag = 1;
        this.info.acnt_certif_id = this.info.license_no;
      }

      // 对私结算入账户名和法人名称一致
      if (this.info.acnt_type == "2") {
        this.info.artif_nm = this.info.acnt_nm;
      }

      // 处理省市县
      // TODO : 打印一下areas_list, 解析出来省市县province_cd，city_cd，county_cd   // console.log(areas_list)
      // if (Array.isArray(this.info.areas_list)) {
      // }
      this.format_province_city_country();

      this.save();
    }
  },
  computed: {
    info_url$() {
      return INFO_URL;
    },
    info_name$() {
      return INFO_NAME;
    },
    info_pk_id$() {
      return INFO_PK_ID;
    },
    init_license_no_pla() {
      let ret = "";

      if (
        this.info.license_type == 0 ||
        this.info.license_type == 1 ||
        this.info.license_type == 2
      ) {
        ret = "请填写营业执照号码";
      } else if (this.info.license_type == "A") {
        ret = "请填写身份证号码";
      } else if (this.info.license_type == "B") {
        ret = "请填写个体工商户营业执照号码";
      }

      return ret;
    },

    init_license_expire_dt_pla() {
      let ret = "，长期请填20991231，无有效期请填19000101";

      if (
        this.info.license_type == 0 ||
        this.info.license_type == 1 ||
        this.info.license_type == 2
      ) {
        ret = "请填写营业执照到期日" + ret;
      } else if (this.info.license_type == "A") {
        ret = "请填写身份证的到期日" + ret;
      } else if (this.info.license_type == "B") {
        ret = "请填写个体工商户营业执照号的到期日" + ret;
      }

      return ret;
    }
  }
};
</script>

<style lang="less">
.fy-form {
  .ivu-form-item-error-tip {
    display: none;
  }
}
</style>