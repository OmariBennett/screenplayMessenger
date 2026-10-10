<script lang="ts">
  import screenplayData from '../data/screenplayData.json';

  const { title, byline, contact } = screenplayData;
</script>

<div class="script-page-content script-title-page">
  <p class="title">{title}</p>
  <p class="byline">Written by<br>{byline}</p>
  <p class="contact">{contact.name}<br>{contact.email}</p>
</div>
