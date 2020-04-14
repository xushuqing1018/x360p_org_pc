<template>
    <div class="overview-index-notice-container">
        <i class="icon-shiting"></i>
        <div class="message-box">
            <transition name="fade" v-if="data.length !== 0">
                <div class="message-item" :key="cast_data.title" @click="view(cast_data)">
                    {{cast_data.title}}
                </div>
            </transition>
             <span class="empty" v-else>
                暂无公告
              </span>
        </div>
        <span class="text-info" @click="announce" v-show="visible">
            <Icon type="plus" title="发布公告" size="16" :style="{color: theme_color}"></Icon>
        </span>
    </div>
</template>

<script>
import util from '@/libs/util'
import grid from '@/libs/grid.mixin'
import common from '@/libs/common.mixin'

export default {
  name: 'BroadCast',
  mixins: [grid,common],
  props: {
    visible: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      rest_api: 'broadcasts',
      cast_data: {}
    }
  },
  mounted() {
    this.init_data()
  },
  methods: {
    announce() {
      this.$Modal.open('dashboard/home/broadcast/arrange-cast.vue@modal',{autoShow:false})
      .then(modal=>{
        modal.vuec.init()
        .show('公告管理','add')
      })
    },
    refresh() {
      this.init_data()
    },
    view(row){
      this.$Modal.open('dashboard/home/broadcast/edit-modal.vue',{
        props: {
          id: row.bc_id
        },
        on:{
          'save':() => {
            this.init_data()
          }
        }
      })
      .then(modal => {
        modal.show(util.sprintf('查看公告【%s】',row.title),'edit')
      })
    }
  },
  computed: {
    
  },
  watch: {
      data: function() {
          if (this.scrollId) {
              clearInterval(this.scrollId);
          }
          let index = 0;
          if (this.data && this.data[index]) {
              this.cast_data = this.data[index];
              index++;
              const length = this.data.length;
              this.scrollId = setInterval(() => {
                  let currentIndex = (index++) % length;
                  this.cast_data = this.data[currentIndex];
              }, 3000);
          }
          else {
              this.cast_data = {};
          }
      }
  }
}
</script>
<style lang="less">
    .overview-index-notice-container {
        position: relative;
        height: 38px;
        border: 1px solid #fff;
        .message-box {
            width: 50%;
            margin: 10px 0 0 45px;
            height: 20px;
            overflow: hidden;
            .message-item {
                height: 20px;
                line-height: 20px;
                font-size: 12px;
                cursor: pointer;
            }
            .fade-enter-active, .fade-leave-active{
                transition: all 1.5s;
            }
            .fade-enter-active{
                margin-top: 0;
            }
            .fade-leave-active{
                margin-top: -20px;
            }
        }
        .icon-shiting {
            position: absolute;
            top: 12px;
            margin-left: 13px;
            font-size: 14px;
        }
        >span {
            position: absolute;
            right: 10px;
            top: 10px;
            cursor: pointer;
        }
    }
</style>