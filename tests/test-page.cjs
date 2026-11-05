// This bridge exists only in the test server response, never in shipped assets.
function instrumentHtml(html) {
  return String(html).replace('</html>', `<script type="module">
    await import('/js/app.js');
    const store = await import('/js/store.js');
    const view = await import('/js/catalog-view.js');
    const dataModule = await import('/js/data.js');
    const planner = await import('/js/planner.js');
    const photos = await import('/js/photos.js');
    Object.defineProperties(window, {
      data: {get: () => store.data},
      dishImage: {get: () => photos.photoState.dishImage}
    });
    Object.assign(window, {PRESET_DISHES:dataModule.PRESET_DISHES, PRESET_SHOPS:dataModule.PRESET_SHOPS,
      dishPhoto:view.dishPhoto, displayImage:dataModule.displayImage, total:planner.total, mutate:store.mutate});
  </script></html>`);
}
module.exports = { instrumentHtml };
