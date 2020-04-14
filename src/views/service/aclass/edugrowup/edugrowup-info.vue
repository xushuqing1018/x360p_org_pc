<template>
  <div class="c-grid">
    <div class="col-sm-12" style="margin-bottom: 10px">
			<Button type="primary" icon="reply" size="small" @click="back"></Button>
      <Button type="primary" icon="refresh" @click="resetSearch" size="small">重置</Button>
		</div>
    <div class="box box-result">
	    <div class="content">
        <div>
          <span class="text-title">
				    <span v-if="info.student">{{info.student.student_name}}-</span>
            <span>-{{info.title}}</span>
            <span>{{info.content}}</span>
			    </span>
	      </div>
	      <div class="content-body">
          <div class="row-grid before-after">
              <span style="font-size:20px;">之前</span>
              <span style="font-size:20px;">之后</span>
          </div>
          <div v-for="(item,index) in info.edu_growup_item" :key="index" class="row-grid">
            <div style="text-align: center;" class="operation">
              <Dropdown trigger="click" style="margin-left: 20px">
                <slot>
			            <Button type="primary" size="small">
                    操作
                    <Icon type="arrow-down-b"></Icon>
                  </Button>
		            </slot>
                <DropdownMenu slot="list">
                  <DropdownItem @click.native="edit(item)">
                    <Icon type="edit"></Icon>
                    编辑
                  </DropdownItem>
                  <DropdownItem @click.native="del(item)">
                    <Icon type="ios-trash"></Icon>
                    删除
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
            <div class="growup-content"> 
              <div class="growup-title">
                <span>{{item.title}}</span>
              </div>
              <div class="growup-before">
                <div>
                  <p>{{item.before_content}}</p>
                  <img 
                  :src="img" 
							    v-for="(img,imgIndex) in UploadList(item,'before')" 
                  :key="imgIndex"
                  >
                </div>
              </div>
              <div class="growup-after">
                <div>
                  <p>{{item.after_content}}</p>
                  <img 
                  :src="img" 
							    v-for="(img,imgIndex) in UploadList(item,'after')" 
                  :key="imgIndex"
                  > 
                </div>  
              </div>
              </div>
          </div>   
		    </div>
        <div class="content-footer">
          <Icon type="plus-circled" @click="add" size="40" color="#3399EE"></Icon>
        </div>
			</div>
	</div>
  </div>
</template>

<script>
  import util from '@/libs/util'
	import common from '@/libs/common.mixin'
  import globals from '@/libs/globals.mixin'
  import grid from '@/libs/grid.mixin'
  
  export default {
    mixins: [common, globals, grid],
    data () {
      return {
        info: {},
        id: this.$route.params.id,
      }
    },
    mounted () {
			this.init_data()
		},
    methods: {
      back () {
				this.$router.go(-1)
      },
      resetSearch () {
        this.init_data()
      },
      init_data () {
				let uri = util.sprintf('share/edu_growup?eg_id=%s&with=edu_growup_item.edu_growup_pic,student,one_class',this.id)
				this.$rest(uri).get()
				.success(data=>{
          this.info = data
				}).error(response=>{
					this.error(response.body.message||'获取失败！')
				})
      },
      UploadList (item,position) {
      	let [list,attachments,img_list] = [item.edu_growup_pic,[],[]]
      	if(list.length > 0){            		
      	  attachments = list.filter(l=>l.position==position)            		
      	  	if(attachments.length > 0){
      	  		attachments.forEach(a=>{
      	  			img_list.push(a.url)		
      	  		})
      	  	}            		
      	  }
      	  return img_list
      },
      edit (item) {
        let title = util.sprintf('编辑【%s】成长对比',this.info.student.student_name)
        this.$Modal.open('service/aclass/edugrowup/edugrowup-add-modal.vue',{
          on: {
						'on-success':() => {
							this.init_data()
						}
					}
        }
        )
        .then(modal=>{
          modal
						.set('item',item)
						.show(title, 'edit')
        })
      },
      del (row) {
        this.$rest("edu_growup_items")
          .delete(row.egi_id)
          .success((response)=>{
            this.init_data()
            this.$Message.success('删除成功')
          })
          .error((response)=>{
            this.error(response.body.message)
        })
      },
      add () {
        let title = util.sprintf('添加【%s】成长对比',this.info.student.student_name)
        this.$Modal.open('service/aclass/edugrowup/edugrowup-add-modal.vue',{
          on: {
						'on-success':() => {
							this.init_data()
						}
					}
        })
        .then(modal=>{
          modal.show(title, 'add')
	        })
        },
    }
  }
</script>

<style scoped>
  .row-grid {
    position: relative;
    text-align: center;
  }

  img {
    width: 100px;
    height: 100px;
    margin: 3px 3px;
  }

  .text-title span{
    font-size: 16px;
  }

  .content-footer {
    text-align: center;
  }

  .content-body {
    background: url(https://sp1.xiao360.com/static/img/neza/org/duibi-BG.jpg) repeat-y;
	  background-size: contain;
  }

  .growup-content {
    display: flex;
    position: relative;
  }

  .growup-content p {
    font-size: 16px;
    margin: 3px auto;
  }

  .growup-title {
    position: absolute;
    left: 45%;
    width: 10%;
  }

  .growup-title span {
    background-color: white; 
    border-radius: 5px;
    padding: 5px;
    font-size: 16px; 
  }

  .before-after {
    display: flex;
    color: white;
  }

  .growup-before,.growup-after,.before-after span{
    flex: 0 0 50%;
  }
  
  .growup-before div, .growup-after div{
    width: 85%;
    border-radius: 5px;
    background-color: #fff;
    position: relative;
    left: 7.5%;
    margin: 20px 0;
  }
  
  div.operation {
    position: absolute;
    z-index: 1000;
    top: -2.3%;
    right: 0.5%;
  }
</style>