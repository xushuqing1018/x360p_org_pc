<template>
  <div>
    <RadioGroup size="small" v-model="rid" type="button" class="ml-1 mb-2" @on-change="emitEvent">
      <Radio :label="0">所有角色</Radio>
      <Radio v-for="(item,index) in rids" :key="index" :label="item">{{item|role_name}}</Radio>
    </RadioGroup>
    <Alert show-icon>
      <p>菜单图标(格式:.jpg/png,尺寸:50px*50px,文件大小:&lt;= 200KB),角色不选表示所有角色都可以看到</p>
    </Alert>
    <table class="modal-table">
      <thead>
        <tr>
          <th>
            <div class="ivu-table-cell">菜单</div>
          </th>
          <th>
            <div class="ivu-table-cell">图标</div>
          </th>
          <th>
            <div class="ivu-table-cell">启用</div>
          </th>
          <th width="200">
            <div class="ivu-table-cell">角色</div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item,index) in config.my_menu" :key="index" v-show="rid === 0 || item.rids.length == 0 || item.rids.indexOf(rid)!==-1">
          <td>
            <div class="ivu-table-cell">
				<div>
					<Input v-model="item.label" size="small" style="width: 80px;" placeholder="菜单文字"></Input>
				</div>
				<div v-if="is_gm"><Input :readonly="item.name=='my'||item.name=='home'" v-model="item.name" size="small" style="width: 80px;" placeholder="菜单ID"></Input></div>
				<div v-if="is_gm"><Input :readonly="item.name=='my'||item.name=='home'" v-model="item.link" size="small" style="width: 120px;" placeholder="菜单链接"></Input></div>
             
            </div>
          </td>
          <td>
            <div class="ivu-table-cell">
              <img
                :src="item.icon"
                style="width: 40px;height: 40px;"
                v-if="item.icon.indexOf('.')>-1"
              />
              <Icon :type="item.icon" size="40" v-else style="vertical-align: middle;"></Icon>
			  	<c-upload v-model="item.icon" btn-text="设置图标"></c-upload>
            </div>
          </td>
          <td>
            <div class="ivu-table-cell">
             
			  <div class="text-center">
					<i-switch size="small" v-model="item.enable" :true-value="1" :false-value="0"></i-switch>
				</div>
				<div class="text-center" v-if="is_gm">
					<Icon type="ios-close-outline" @click="delMenu(index,config.my_menu)"></Icon>
					<Icon type="ios-arrow-thin-up" @click="upMenu(index,config.my_menu)" v-if="index>0"></Icon>
					<Icon type="ios-arrow-thin-down" @click="downMenu(index,config.my_menu)" v-if="index<menu_length-1"></Icon>
				</div>
            </div>
          </td>
		  <td>
            <div class="ivu-table-cell">
				<Select size="small" v-model="item.rids" multiple>
					<Option v-for="item in roles" :value="item.rid" :key="item.rid">{{item.role_name}}</Option>
				</Select>
            </div>
          </td>
        </tr>
		<tr v-if="is_gm">
			<td colspan="4">
				<div class="text-center">
					<Button type="default" long icon="plus" @click="addMenu(config.my_menu)">添加</Button>
				</div>
			</td>
		</tr>
      </tbody>
    </table>
    <div class="mt-4">
      <Button type="primary" @click="handleSubmit">保存</Button>
      <Button type="ghost" @click="restoreDefault" class="ml-2" :disabled="cfg_id==0">恢复默认设置</Button>
    </div>
  </div>
</template>
<script>
import util from "@/libs/util";
import common from "@/libs/common.mixin";
import config from "@/libs/config.mixin";
import globals from "@/libs/globals.mixin";
import cUpload from 'c%/cUpload.vue';
export default {
  mixins: [common, config, globals],
  components:{
	cUpload
  },
  data() {
    return {
      cfg_name: "org_mobile_ui",
      config: {
        home_menu: [],
        my_menu: [],
        tab_bar: {}
      },
      rid: 0,
      rids: []
    };
  },
  methods: {
    selectFromMyFile(item) {
      this.$Modal
        .open("components/SelectFile.vue@modal", {
          props: {
            selType: "image",
            "hide-upload-bylocal": false
          },
          on: {
            selected: data => {
              item.icon = data.file_url;
            }
          }
        })
        .then(modal => {
          modal.vuec.show("选择图标", "list");
        });
	},
	inputIcon(item){
		let icon = item.icon
		this.$Modal.confirm({
			render: (h) => {
				return h('Input', {
					props: {
						value: icon,
						autofocus: true,
						placeholder: '请输入图标地址...'
					},
					on: {
						input: (val) => {
							icon = val;
						}
					}
				})
			},
			onOk:()=>{
				if(!/^\s*$/.test(icon)){
					item.icon = icon
				}
			}
		})
	},
    initFinished() {
		this.rids = [];
		this.config.my_menu.forEach(m => {
			m.rids.forEach(r => {
			if (this.rids.indexOf(r) == -1) {
				this.rids.push(r);
			}
			});
		});
		if (this.rids.length > 0) {
			this.rid = this.rids[0];
		}
		this.emitEvent();
	},
    emitEvent() {
      this.$emit("on-change", {
        config: this.config,
        rid: this.rid,
        rids: this.rids
      });
	},
	addMenu(row){
		row.push({
			label:'',
			icon:'ios-folder-outline',
			name:'',
			link:'',
			enable:0,
			rids:[]
		})
	},
	delMenu(index,menu){
		this.$Modal.confirm({
			title:'确认操作',
			content:'<p>您确定要删除菜单吗?',
			onOk:()=>{
				menu.splice(index,1)
			}
		})
	},
	upMenu(index,menu){
		if(index == 0){
			return
		}
		let tmp = menu[index]
		menu.splice(index,1)
		if(index == 1){
			menu.unshift(tmp)
		}else{
			menu.splice(index-1,0,tmp)
		}
	},
	downMenu(index,menu){
		let max = menu.length-1
		if(index == max){
			return
		}
		let tmp = menu[index]
		menu.splice(index,1)
		if(index == max-1){
			menu.push(tmp)
		}else{
			menu.splice(index+1,0,tmp)
		}
	}
  },
  watch: {
    config: function(data) {
      this.emitEvent();
    }
  },
  computed:{
	  menu_length(){
		  if(this.rid == 0){
			  return this.config.my_menu.length
		  }
		  let length = 0
		  this.config.my_menu.forEach(item=>{
			  if(item.rids.indexOf(this.rid) !== -1){
				  length ++
			  }
		  })
		  return length
	  }
  }
};
</script>