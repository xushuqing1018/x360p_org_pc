<template>
  <div class="sidebar">
    <nav class="sidebar-nav">
      <ul class="nav">
        <SidebarNavItem>
          <SidebarNavLink name="工作台" url="/dashboard/home" icon="icon-gongzuotai"/>
        </SidebarNavItem>
        <template v-for="(item, index) in navs">
          <template v-if="item.title">
            <SidebarNavTitle :name="item.text" :classes="item.excls" :wrapper="item.wrapper"/>
          </template>
          <template v-else-if="item.divider">
            <li class="divider"></li>
          </template>
          <template v-else>
            <template v-if="item.sub && !item.hidesub && item.sub.length > 0">
              <!-- First level dropdown -->
              <SidebarNavDropdown :name="item.text" :url="item.uri|uri" :icon="item.class">
                <template v-for="(childL1, index) in item.sub">
                  <template v-if="childL1.sub && !childL1.hidesub && childL1.sub.length > 0">
                    <!-- Second level dropdown -->
                    <SidebarNavDropdown :name="childL1.text" :url="childL1.uri|uri" :icon="childL1.class">
                      <li class="nav-item" v-for="(childL2, index) in childL1.sub">
                        <SidebarNavLink :name="childL2.text" :url="childL2.uri|uri" :icon="childL2.class" :badge="childL2.badge" :variant="item.variant"/>
                      </li>
                    </SidebarNavDropdown>
                  </template>
                  <template v-else>
                    <SidebarNavItem :classes="item.excls">
                      <SidebarNavLink :name="childL1.text" :url="childL1.uri|uri" :icon="childL1.class" :badge="childL1.badge" :variant="item.variant" :sub="childL1.sub"/>
                    </SidebarNavItem>
                  </template>
                </template>
              </SidebarNavDropdown>
            </template>
            <template v-else>
              <SidebarNavItem :classes="item.excls">
                <SidebarNavLink :name="item.text" :url="item.uri|uri" :icon="item.class" :badge="item.badge" :variant="item.variant"/>
              </SidebarNavItem>
            </template>
          </template>
        </template>
      </ul>
    </nav>
  </div>
</template>
<script>
import SidebarNavDropdown from './sidebar/nav-dropdown.vue'
import SidebarNavLink from './sidebar/nav-link.vue'
import SidebarNavTitle from './sidebar/nav-title.vue'
import SidebarNavItem from './sidebar/nav-item.vue'

export default {
  name: 'sidebar',
  components:{
    SidebarNavDropdown,
    SidebarNavLink,
    SidebarNavTitle,
    SidebarNavItem
  },
  filters:{
    uri:function(value){
      return '/'+value.replace(/\./g,'/')
    }
  },
  computed:{
    navs(){
        if(this.$store.state.gvars.navs){
          return this.$store.state.gvars.navs.main
        }
        return this.$store.state.user.info.navs.main
    },
  }
}
</script>
