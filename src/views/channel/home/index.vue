<script setup lang="ts">
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Edit from "~icons/ep/edit";
import Collection from "~icons/ep/collection";
import Search from "~icons/ep/search";
import Handshake from "~icons/ri/shake-hands-line";
import User from "~icons/ep/user";
import NoticeList from "./NoticeList.vue";

defineOptions({
  name: "Welcome"
});

const steps = [
  {
    title: "① 设置频道名称",
    icon: Edit,
    items: [
      '账号开通后，首先需要设置"频道名称"（即客户在小程序、电脑客户端前台，顶部看到的名字），在顶部频道名右侧，点击编辑设置名称；'
    ]
  },
  {
    title: "② 创建歌单",
    icon: Collection,
    items: [
      '方便管理运营自己频道内的歌曲。在曲库管理菜单左上方Tab频道歌单点击"新增"创建自己的歌单（可创建多个）；'
    ]
  },
  {
    title: "③ 中央曲库选歌",
    icon: Search,
    items: [
      'a、【前往选歌】点击左侧菜单下方中央曲库挑选歌曲，或在曲库管理菜单，频道曲库Tab下，点击"中央曲库-选歌"；',
      'b、【挑选歌曲】前往【中央曲库】后，可以通过"歌单"、"曲风"、"语种"，等...方式挑选适合的歌曲，将歌曲加入"频道曲库"以及加入"频道歌单"',
      'c、【打标签、加视频】在【中央曲库】挑选完成后，回到【频道后台】（当前系统）。在曲库管理菜单，频道曲库tab下，对已添加的歌曲，点击"编辑"操作。可以打自定义标签，编辑歌曲推荐理由，以及添加视频；',
      'd、【设置排序】频道歌单支持精细化运营，可以设置歌曲在歌单中的"权重"，客户在浏览歌单时，将从权重由高到底进行展示。在曲库管理菜单，频道歌单Tab下，点击"编辑"设置歌曲权重值；'
    ]
  },
  {
    title: "④ 添加客户",
    icon: User,
    items: [
      'a、【处理客户申请】客户申请试听自己频道的歌曲，会收到邮件提醒。在歌曲客户菜单，客户申请Tab下，查看申请的客户。点击"处理"按钮，可以同意或拒绝客户浏览频道的歌曲；',
      'b、【主动添加客户】当需要把歌曲给客户试听，客户未申请的情况，在歌曲客户菜单，我的客户Tab下，点击"添加客户"，输入客户完整的邮箱进行搜索。然后设置对应的权限即可'
    ]
  },
  {
    title: "⑤ 促成合作",
    icon: Handshake,
    items: [
      '当客户试听歌曲后，遇到合适的歌曲会点击"合作申请"，这时会收到邮件提醒。在合作申请菜单，对客户有合作意向的歌曲进行"确权"，以及沟通授权相关事宜；'
    ]
  }
];
</script>

<template>
  <div class="main home bg-bg_color m-6! p-5">
    <section class="home__guide">
      <h3 class="home__title">使用说明</h3>
      <div class="home__steps">
        <div v-for="step in steps" :key="step.title" class="home__step">
          <div class="home__step-icon">
            <component :is="useRenderIcon(step.icon)" />
          </div>
          <div class="mt-2 text-center">{{ step.title }}</div>
        </div>
      </div>
      <el-divider />
      <div v-for="step in steps" :key="step.title" class="home__detail">
        <div class="home__detail-title">{{ step.title }}</div>
        <div class="home__detail-body">
          <p v-for="item in step.items" :key="item">{{ item }}</p>
        </div>
      </div>
    </section>

    <aside class="home__side">
      <NoticeList :type="1" title="公告" />
      <el-divider />
      <NoticeList :type="2" title="手册&附件" />
    </aside>
  </div>
</template>

<style lang="scss" scoped>
.home {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 20px;

  &__title {
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 700;
  }

  &__steps {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  &__step {
    flex: 1;
    min-width: 110px;
  }

  &__step-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 92px;
    font-size: 30px;
    background: var(--el-fill-color);
  }

  &__detail {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
    line-height: 26px;
  }

  &__detail-title {
    flex-shrink: 0;
    width: 120px;
  }

  &__side {
    padding-left: 20px;
    border-left: 1px solid var(--el-border-color-lighter);
  }
}

@media (width <= 900px) {
  .home {
    grid-template-columns: minmax(0, 1fr);

    &__side {
      padding-left: 0;
      border-left: 0;
    }
  }
}
</style>
