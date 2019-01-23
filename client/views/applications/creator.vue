<template>
  <v-dialog persistent :value="show" width="500">
    <v-card>
      <v-card-title
        class="headline lighten-2"
        primary-title
      >
        创建应用
      </v-card-title>

      <v-card-text>
        <v-form v-model="valid" ref="form" lazy-validation>
          <v-container>
            <v-text-field
              label="名称"
              v-model="name"
              :rules="[rules.required, rules.noIllegalChars]"
            />
            <v-text-field
              label="appKey"
              v-model="key"
              :rules="[rules.required, rules.key]"
            />
          </v-container>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <div class="pb-2 pr-2">
          <v-btn flat color="blue-grey darken-4" @click="$emit('cancle')">取消</v-btn>
          <v-btn flat color="blue-grey darken-4" @click="create" :disabled="!valid">创建</v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import request from 'framework/request';


export default {
  props: {
    show: Boolean,
  },

  data() {
    return {
      valid: true,

      key: 'application.website.',
      name: '',

      verification: {
        key: { pass: true, message: '' },
        name: { pass: true, message: '' },
      },

       rules: {
        required: value => !!value || '必填',
        key: value => /^application\.(website)(\.[a-zA-Z-]+)+$/.test(value) || '格式需符合application.website.xxx',
        noIllegalChars: value => !/[!@#\$%\^&*_\-+=\|\\]/.test(value) || '包含非法字符',
      },
    }
  },

  methods: {
    async create() {
      if (!this.$refs.form.validate()) return;

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

