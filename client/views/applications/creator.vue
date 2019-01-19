<template>
  <div v-if="show" class="creator">
    <div class="mask" @click="$emit('cancle')" />

    <div class="form">
      <div>
        <input type="text" v-model="key" placeholder="appkey" />
        <span v-if="!verification.key.pass">{{verification.key.message}}</span>
      </div>

      <div>
        <input type="text" v-model="name" placeholder="name" />
        <span v-if="!verification.name.pass">{{verification.name.message}}</span>
      </div>

      <button @click="create">确认</button>
    </div>

  </div>
</template>
<script>
import request from 'framework/request';


export default {
  props: {
    show: Boolean,
  },

  data() {
    return {
      key: '',
      name: '',

      verification: {
        key: { pass: true, message: '' },
        name: { pass: true, message: '' },
      },
    }
  },

  methods: {
    async validate() {
      let valid = true

      if (!this.key.length) {
        this.verification.key = { pass: false, message: '请填写appkey' }
        valid = false
      } else if (!/^application\.(website)(\.[a-zA-Z-]+)+$/.test(this.key)) {
        this.verification.key = { pass: false, message: 'appkey格式错误' }
        valid = false
      }

      if (!this.name.length) {
        this.verification.name = { pass: false, message: '请填写名称' }
        valid = false
      } else if (/[!@#\$%\^&*_\-+=\|\\]/.test(this.name)) {
        this.verification.name = { pass: false, message: '名称格式错误' }
        valid = false
      }

      return valid
    },

    async create() {
      if (!await this.validate()) return

      try {
        const application = await request
          .post('/api/applications')
          .send({ key: this.key})
          .send({ name: this.name })
          .then(body => body.data)

        console.log('创建应用：', application)
        this.$emit('created', { application })
      } catch (e) {
        console.log('无法创建应用', e)
        this.$emit('error', e)
      }
    },
  }
}
</script>
<style lang="postcss" scoped>
.creator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.form {
  position: absolute;
  top: 40%;
  left: 50%;
  background: #fff;
  transform: translate(-50%, -50%);
  padding: 30px;
  border-radius: 2px;
}
</style>

