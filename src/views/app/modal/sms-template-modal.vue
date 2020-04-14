<template>
  <Modal
    v-drag-modal
    :mask-closable="false"
    width="700"
    v-model="modal$.show"
    :title="modal$.title"
  >
    <div class="sms-balance" v-if="balance != -1">
      短信余额:<span class="num">{{balance}}</span>条 
      <a class="charge_link" target="_blank" :href="charge_url">充值</a>
    </div>
    <Button size="small" class="sms-record-btn" type="ghost" @click="showMessageGroupHistory">短信发送记录</Button>

    <Form ref="form" :model="info" :label-width="80" v-if="action == 'form'">
      <Form-item label="接收对象" class="custom-form-item-required">
        <template v-if="objectType == ''">
          <span>
            <CheckboxGroup v-model="info.collections">
              <Checkbox :label="item.value" v-for="(item,index) in send_collections" :key="index">
                  <Icon type="social-twitter"></Icon>
                  <span>{{item.name}}</span>
                  <span v-if="item.count > -1">({{item.count}})</span>
              </Checkbox>
            </CheckboxGroup>
          </span>
          <span class="inline" v-if="info.collections.length == 0">
            <Dropdown>
              <Button 
              type="primary"
              :disabled="info.collections.length >0"
              size="small">
                选择特定号码发送
                <Icon type="arrow-down-b"></Icon>
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem @click.native="openModal('s')">从学员名单选择</DropdownItem>
                <DropdownItem @click.native="selectClassStudent">从班级选择学员</DropdownItem>
                <DropdownItem @click.native="openModal('c')">从客户名单选择</DropdownItem>
                <DropdownItem @click.native="openModal('m')">从市场名单选择</DropdownItem>
                <DropdownItem @click.native="openModal('e')">从员工选择</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </span>
        </template>
        <Table
          class="sms-fixed-table"
          height="250"
          :columns="columns"
          :data="info.data"
          no-data-text="请选择接收对象"
          v-if="info.collections.length ==0"
        ></Table>


      </Form-item>
      <Form-item label="发送内容" v-help="contentHelp" class="custom-form-item-required">
        <RadioGroup size="small" type="button" v-model="content_type" v-if="hasSmsTpl">
          <Radio :label="0">自由短信</Radio>
          <Radio :label="1">模板短信</Radio>
        </RadioGroup>
        <template v-if="content_type == 1">
          <div v-if="noFreeCloudServer">
            <Alert type="error" show-icon>您还没有配置短信模板,请在【系统】【系统设置】【短信模板设置】配置</Alert>
          </div>
          <div class="m-tb">
            <Select v-model="info.std_id">
              <Option :value="0">请选择短信模板</Option>
              <Option
                v-for="(item,index) in sms_tpls"
                :value="item.std_id"
                :key="index"
              >{{item.name}}</Option>
            </Select>
          </div>
        </template>
        <template v-if="content_type == 0">
          <div v-if="noFreeCloudServer">
            <Alert type="error" show-icon>您还没有配置可以用于发送自由短信的服务商,请在【系统】【系统设置】【短信模板设置】配置</Alert>
          </div>
          <div v-if="multiFreeCloudSerer">
            发送通道:
            <RadioGroup size="small" type="button" v-model="info.server">
              <Radio :label="item.server">{{item.name}}</Radio>
            </RadioGroup>
          </div>
        </template>
          <div class="sms-content" v-if="texts.length > 0 && content_type == 1">
            <span v-for="(item,index) in texts" :key="index">
              <template v-if="item.type == 'text'">{{item.text}}</template>
              <template v-if="item.type == 'input'">
                <input
                  type="text"
                  v-model="info.tpl_data[item.v]"
                  class="sms-input-val-input"
                  :placeholder="'请输入:变量'+item.v"
                />
              </template>
            </span>
          </div>
          <div class="sms-content" v-else>
            <Input type="textarea" v-model="info.content"></Input>
            <div class="sms-content-toolbar">
              <Checkbox 
                v-model="auto_prefix" 
              >
                自动尊称
              </Checkbox>
            </div>
            <div class="sms-content-count">
              已输入<span class="num">{{word_nums}}</span>字符,包含签名信息总长度<span class="num">{{word_full_nums}}</span>字符,将按<span class="num">{{sms_nums}}</span>条短信计费，
              <template v-if="totalNums > 0">共发送 <span class="num">{{totalNums}}</span>人，合计<span class="num">{{sms_total_nums}}</span>条短信</template>
              计费仅供参考，以实际扣费为准。
            </div>
          </div>
        
      </Form-item>
    </Form>

    <div class="tip-wrap" v-if="action == 'success'">
      <Alert type="success" show-icon>
        发送提示
        <span slot="desc">短信发送任务已经加入后台队列,请在短信发送记录查看发送状态!</span>
      </Alert>
    </div>

    <div slot="footer">
      <Button type="ghost" @click="close" :disabled="saving">关闭</Button>
      <Button type="primary" @click="send" :loading="saving" v-if="action == 'form'">发送</Button>
      <Button type="primary" @click="backForm" v-if="action == 'success'">继续发送</Button>
    </div>
    <select-student 
    v-model="select.sids" 
    ref="smodal" 
    class="d-none" 
    @on-selected="selectStudent"
    ></select-student>
    <select-customer
      v-model="select.cu_ids"
      ref="cmodal"
      class="d-none"
      @on-selected="selectCustomer"
    ></select-customer>
    <select-market 
    v-model="select.mcl_ids" 
    ref="mmodal" 
    class="d-none" 
    @on-selected="selectMarket">
    </select-market>
    <select-employee 
    v-model="select.eids" 
    ref="emodal" 
    class="d-none" 
    @on-selected="selectEmployee">
    </select-employee>
  </Modal>
</template>
<script>
import util, { _ } from "@/libs/util";
import modal from "@/libs/modal.mixin";
import common from "@/libs/common.mixin";
import globals from "@/libs/globals.mixin";
import SelectEmployee from "c%/SelectEmployee.vue";
import SelectStudent from "c%/SelectStudent.vue";
import SelectCustomer from "c%/SelectCustomer.vue";
import SelectMarket from "c%/SelectMarket.vue";

const VREG = /\{[^\}]+\}/g;

const emptyObject = {
  type: 1,
  collections:[],
  data: [],
  std_id: 0,
  server: "",
  sms_content: {},
  content: "",
  tpl: "",
  tpl_data: {},
  tpl_id: ""
};

const SMART_PREFIX = '尊敬的[姓名]家长:'

export default {
  name:'SmsTemplateModal',
  mixins: [modal, common, globals],
  props:{
    sendObject:{
      type:Array,
      default(){
        return []
      }
    },
    objectType:{
      type:String,
      default:''
    }
  },
  components: {
    SelectEmployee,
    SelectStudent,
    SelectCustomer,
    SelectMarket
  },
  data() {
    return {
      contentHelp: "在输入框里输入 [姓名] 可动态的替换接收对象的姓名",
      balance:-1,
      action: "form",
      auto_prefix:false,
      info: util.copy(emptyObject),
      content_type: 0, //自由短信,模板短信
      sms_tpls: [],
      sms_tpls_map: {},
      templateArr: [],
      select: {
        eids: [],
        cu_ids: [],
        sids: [],
        mcl_ids: []
      },
      sendType: 0,
      texts: [],
      send_collections:[
        {name:'所有市场名单',value:'market_clues',selected:false,count:-1},
        {name:'所有客户名单',value:'customers',selected:false,count:-1},
        {name:'所有学员档案',value:'students',selected:false,count:-1},
        {name:'所有员工',value:'employees',selected:false,count:-1}
      ],
      columns: [
        {
          title: "姓名",
          key: "name",
          render: (h, params) => {
            let map = { sid: "#19be6b", cu_id: "#2d8cf0", mcl_id: "#13c2c2" };
            let id_key = this.getIdKey(params);
            return h(
              "span",
              {
                style: {
                  color: map[id_key] || "#657180"
                }
              },
              params.row.name
            );
          }
        },
        {
          title: "手机号",
          key: "mobile"
        },
        {
          title: "操作",
          key: "del",
          width: 80,
          render: (h, params) => {
            return h("Button", {
              props: {
                type: "ghost",
                size: "small",
                shape: "circle",
                icon: "ios-trash"
              },
              on: {
                click: () => {
                  let id_key = this.getIdKey(params);
                  let index = this.info.data.findIndex(
                    item => item[id_key] === params.row[id_key]
                  );
                  this.info.data.splice(index, 1);
                }
              }
            });
          }
        }
      ]
    };
  },
  computed: {
    hasSmsTpl(){
      return this.sms_tpls.length > 0
    },
    sNums() {
      return this.info.data.filter(item => item.sid > 0).length;
    },
    cNums() {
      return this.info.data.filter(item => item.cu_id > 0).length;
    },
    mNums() {
      return this.info.data.filter(item => item.mcl_id > 0).length;
    },
    eNums() {
      return this.info.data.filter(item => item.eid > 0).length;
    },
    totalNums() {
      let nums = 0
      if(this.info.collections.length > 0){
        this.send_collections.forEach(item=>{
          if(item.count > -1 && this.info.collections.indexOf(item.value) !== -1){
            nums += item.count
          }
        })
      }else{
        nums = this.info.data.length
      }
      return nums
    },
    freeCloudServer() {
      return this.sms_clounds.filter(item => {
        return item.enable == 1 && item.can_free == 1;
      });
    },
    noFreeCloudServer() {
      return !this.freeCloudServer || this.freeCloudServer.length == 0;
    },
    multiFreeCloudSerer() {
      return this.freeCloudServer && this.freeCloudServer.length > 1;
    },
    onlyOneFreeCloudServer() {
      return this.freeCloudServer && this.freeCloudServer.length == 1;
    },
    theOnlyFreeCloudServer() {
      return this.freeCloudServer[0];
    },
    charge_url() {
      let info = this.$store.state.user.info,
        url  = info.product_url.split('//'),
        token = info.token

      return util.sprintf("%s//vip.%s/#/smsbuy?token=%s",url[0],url[1],token)
    },
    word_nums(){
      return util.char_len(this.info.content)
    },
    word_full_nums(){//内容加签名长度
      if(!this.theOnlyFreeCloudServer || !this.theOnlyFreeCloudServer.params.sign){
        return this.word_nums
      }
      return this.word_nums + util.char_len(this.theOnlyFreeCloudServer.params.sign)
    },
    sms_nums(){
      let nums = Math.ceil(this.word_full_nums / 140)

      return nums
    },
    sms_total_nums(){
      return this.sms_nums * this.totalNums
    }
  },
  created() {
    
    if (this.onlyOneFreeCloudServer) {
      this.info.server = this.theOnlyFreeCloudServer.server;
    }
    this.get_balance()
    this.init_count()
  },
  mounted(){
    this.create_data_from_props()
  },
  methods: {
    create_data_from_props(){ //从属性创建info.data
      if(this.objectType == ''){
        return
      }
      switch(this.objectType){
        case 'market_clue':
            this.selectMarket(this.sendObject)
            break;
        case 'customer':
            this.selectCustomer(this.sendObject)
            break;
        case 'student':
            this.selectStudent(this.sendObject)
            break;
        case 'employee':
            this.selectEmployee(this.sendObject)
            break;
      }
    },
    backForm() {
      this.info.data.splice(0);
      this.reset_tpl_data();
      this.action = "form";
    },
    goSuccess() {
      this.action = "success";
    },
    showMessageGroupHistory() {
      this.$Modal
        .open("app/modal/message-group-history-modal.vue", {
          props: {
            "msg-type": 1
          }
        })
        .then(modal => {
          modal.show("短信发送记录");
        });
    },
    getSmsTplDefines() {
      this.$rest("sms_tpl_defines")
        .get({
          pagesize: 100,
          bid: -1
        })
        .success(res => {
          this.sms_tpls = res.list;
          this.build_sms_tpls_map();
        })
        .error(res => {
          this.$Message.error(res.body.message);
        });
    },
    build_sms_tpls_map() {
      if (this.sms_tpls.length == 0) {
        return;
      }
      this.sms_tpls.forEach(item => {
        this.sms_tpls_map[item.std_id] = item;
      });
    },
    typeChange(v) {
      this.info.data.splice(0);
    },
    getIdKey(params) {
      let keys = Object.keys(params.row),
        id_key = "";
      for (let i = 0, len = keys.length; i < len; i++) {
        if (keys[i].indexOf("id") > -1) {
          id_key = keys[i];
          break;
        }
      }
      return id_key;
    },
    selectClassStudent() {
			this.$Modal.open('components/SelectClassModal.vue@modal',{
				props:{
					multiple:false,
					width:'750',
					url: 'classes',
					title: '选择要发送短信的班级'
				},
				on:{
					'on-select':(row)=>{
						this.selectStudentFromClass(row.cid)
					}
				}
			}).then(modal=>{
				modal.show()
			})
    },
    selectStudentFromClass(cid){
      this.$rest('classes')
      .add_url_param(cid,'students')
      .get()
      .success(res=>{
        if(res.list.length == 0){
          this.$Message.error('该班级没有学员!')
          return false
        }
        let students = []
        res.list.forEach(item=>{
          students.push(util.copy(item.student))
        })
        this.selectStudent(students)
      })

    },
    selectTpl(v) {
      this.templateArr = [];
      let tpl = this.sms_tpls.find(item => item.std_id == v);
      if (!tpl) return;
      if (tpl.apply_tpl === "") return;

      let vars = tpl.apply_tpl.match(/(\$\{[a-zA-Z0-9_-]*\})/g);
      let replaceSymbol = vars.map(item => item.replace(/[${}]/g, ""));
      let replaceVar = tpl.apply_tpl.replace(
        /(\$\{[a-zA-Z0-9_-]*\})/g,
        "|input|"
      );
      let tplArr = replaceVar.split("|");
      let inputIndex = 0;

      for (let i = 0, len = tplArr.length; i < len; i++) {
        if (tplArr[i] === "") {
          continue;
        } else {
          if (tplArr[i] === "input") {
            this.templateArr.push({
              tag: "input",
              name: replaceSymbol[inputIndex],
              value: ""
            });
            inputIndex++;
          } else {
            this.templateArr.push({
              tag: "span",
              text: tplArr[i]
            });
          }
          let tl = this.templateArr.length - 1;
          if (this.templateArr[tl].name == "name") {
            this.templateArr[tl].value = "[姓名]";
          }
        }
      }
    },
    openModal(v) {
      this.$refs[v + "modal"].openModal();
    },
    delItem(item) {
      this.info.data.splice(index, 1);
    },
    selectStudent(items) {
      items.forEach(item => {
        let index = this.info.data.findIndex(i => i.sid == item.sid);
        if (index === -1) {
          this.info.data.push({
            sid: item.sid,
            mobile: item.first_tel,
            name: item.student_name
          });
        }
      });
    },
    selectCustomer(items) {
      items.forEach(item => {
        let index = this.info.data.findIndex(i => i.cu_id == item.cu_id);
        if (index === -1) {
          this.info.data.push({
            cu_id: item.cu_id,
            mobile: item.first_tel,
            name: item.name
          });
        }
      });
    },
    selectEmployee(items) {
      items.forEach(item => {
        let index = this.info.data.findIndex(i => i.eid == item.eid);
        if (index === -1) {
          this.info.data.push({
            eid: item.eid,
            mobile: item.mobile,
            name: item.ename
          });
        }
      });
    },
    selectMarket(items) {
      items.forEach(item => {
        let index = this.info.data.findIndex(i => i.mcl_id == item.mcl_id);
        if (index === -1) {
          this.info.data.push({
            mcl_id: item.mcl_id,
            mobile: item.tel,
            name: item.name
          });
        }
      });
    },
    send() {
      if (this.content_type == 1) {
        //模板短信
        if (this.info.std_id == 0) {
          this.$Message.error("请先选择短信模板");
          return;
        }
        if (this.info.data.length === 0) {
          this.$Message.error("请选择接受对象");
          return;
        }
        if (!_.isEmpty(this.info.tpl_data)) {
          for (let o in this.info.tpl_data) {
            if (this.info.tpl_data[o] == "") {
              this.$Message.error("请输入变量:" + o);
              return false;
            }
          }
          this.info.content = this.complie_sms_content(
            this.info.tpl,
            this.info.tpl_data
          );
        }
      } else {
        //自由短信
        if (this.noFreeCloudServer) {
          this.$Message.error("没有可以用于发送自由短信的通道：服务商");
          return;
        }
        if (this.info.server == "" && this.multiFreeCloudSerer) {
          this.$Message.error("请选择短信发送通道：服务商");
          return;
        }
        if (this.info.content == "") {
          this.$Message.error("请输入短信内容!");
          return;
        }
        if (this.onlyOneFreeCloudServer) {
          this.info.server = this.theOnlyFreeCloudServer.server;
        }
      }

      this.$rest("message_group_historys")
        .post(this.info)
        .success(res => {
          this.goSuccess();
        })
        .error(res => {
          this.error(res.body.message);
        });
    },
    reset_tpl_data() {
      this.clear_info_tpl_data();
      if (
        this.info.std_id > 0 &&
        _.isDefined(this.sms_tpls_map[this.info.std_id])
      ) {
        this.init_info_data();
        this.build_text_input();
      }
    },
    clear_info_tpl_data() {
      this.texts = [];
      this.info.tpl_data = {};
      this.info.tpl = "";
      this.info.tpl_id = "";
    },
    init_info_data() {
      let std_info = this.sms_tpls_map[this.info.std_id];
      this.info.tpl_id = std_info.tpl_id;
      this.info.tpl = std_info.apply_tpl;
      this.info.server = std_info.service_name;
      std_info.tpl_define.forEach(item => {
        if (this.info.tpl.indexOf("{" + item.r + "}") !== -1) {
          this.info.tpl_data[item.r] = "";
        }
      });
    },
    build_text_input() {
      let texts = [];
      let vreg = VREG;
      let matches = this.info.tpl.match(vreg);

      function build_node(input, type) {
        if (type == "text") {
          return {
            type: type,
            text: input
          };
        }
        return {
          type: type,
          v: input.replace(/[\{\}]/g, "")
        };
      }

      if (!matches) {
        texts.push(this.info.tpl, "textarea");
      } else {
        if (matches.length > 0) {
          let pos = 0;
          let t = this.info.tpl;
          matches.forEach(m => {
            let p = t.indexOf(m);
            let len = p - pos;

            texts.push(build_node(t.substr(pos, len), "text"));
            texts.push(build_node(t.substr(p, m.length), "input"));
            pos = p + m.length;
          });
          if (pos <= t.length - 1) {
            texts.push(build_node(t.substr(pos,t.length - pos),'text'));
          }
        }
      }

      this.texts = texts;
    },
    complie_sms_content(tpl, tpl_data) {
      let vreg = VREG;
      let matches = tpl.match(vreg);

      if (!matches) {
        return tpl;
      }

      let content = this.info.tpl;
      let data = tpl_data;

      matches.forEach(m => {
        let v = m.replace(/[\{\}]/g, "");
        content = content.replace(m, data[v]);
      });

      return content;
    },
    get_balance(){
      this.$rest('sms_historys')
      .add_url_param('balance')
      .get()
      .success(data=>{
        this.balance = data.balance
      })
    },
    addAutoPrefix(){
      if(this.info.content.indexOf(SMART_PREFIX) === -1){
        this.info.content = SMART_PREFIX+this.info.content
      }
    },
    removeAutoPrefix(){
      if(this.info.content.indexOf(SMART_PREFIX) !== -1){
        this.info.content = this.info.content.replace(SMART_PREFIX,'')
      }
    },
    init_count(){
      this.send_collections.forEach(item=>{
        this.init_item_count(item)
      })
    },
    init_item_count(item){
      this.$rest(item.value).get({page:1,pagesize:1})
      .success(response=>{
        item.count = response.total
      })
    }
  },
  watch: {
    auto_prefix:function(val){
        if(val){
          this.addAutoPrefix()
        }else{
          this.removeAutoPrefix()
        }
    },
    "modal$.show": function(val) {
      if (val) {
        if(this.objectType == ''){
          this.info = util.copy(emptyObject);
        }
        if (this.sms_tpls.length === 0) {
          this.getSmsTplDefines();
        }
      }
    },
    "info.std_id": function(val) {
      this.reset_tpl_data();
    }
  }
};
</script>
<style lang="less">
.sms-record-btn {
  position: absolute;
  right: 40px;
  top: 10px;
}
.sms-fixed-table.ivu-table-wrapper {
  min-height: 250px;
  margin-top: 6px;
}
.sms-balance{
  position: absolute;
  right: 150px;
  top:10px;
  .num{
    font-weight:bold;
    color:#ff0000
  }
}
.inline{
  .ivu-select{
    width:auto;
  }
}
.sms-content-count{
  .num{color:#ff0000}
}
.charge_link{
  font-size:22px;
  font-weight:bold;
}

</style>
