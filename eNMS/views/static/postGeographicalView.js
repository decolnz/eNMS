/*
global
alertify: false
call: false
connectionParametersModal: false
createDevice: false
createLink: false
deleteAll: false
deviceAutomationModal: false
doc: false
map: false
partial: false
selectedObject: true
showModal: false
showTypeModal: false
switchLayer: false
*/

let viewMode = 'network';

/**
 * Display pools.
 */
function displayPools() { // eslint-disable-line no-unused-vars
  deleteAll();
  call('/get_all/pool', function(pools) {
    for (let i = 0; i < pools.length; i++) {
      if (pools[i].device_longitude && pools[i].device_latitude) {
        createNode(pools[i], nodeType='pool')
      }
    }
  });
  viewMode = 'site';
  $('.menu,#pool-filter').hide();
  $('.global-site-menu,.pool-menu').show();
  alertify.notify('Switch to Pool View');
}

/**
 * Display network.
 */
function displayNetwork() { // eslint-disable-line no-unused-vars
  viewMode = 'network';
  $('#pool-filter').change();
  $('#pool-filter').show();
}

/**
 * Enter pool.
 */
function enterPool(poolId) { // eslint-disable-line no-unused-vars
  viewMode = 'insite';
  $('#map').hide();
  $('#network').show();
  call(`/inventory/pool_objects/${poolId}`, function(objects) {
    console.log(objects);
    displayPool(objects.devices, objects.links);
  });
}

$('#pool-filter').on('change', function() {
  call(`/inventory/pool_objects/${this.value}`, function(objects) {
    deleteAll();
    objects.devices.map((d) => createNode(d, nodeType='device'));
    objects.links.map(createLink);
  });
});

const action = {
  'Export to Google Earth': partial(showModal, 'google-earth'),
  'Open Street Map': partial(switchLayer, 'osm'),
  'Google Maps': partial(switchLayer, 'gm'),
  'NASA': partial(switchLayer, 'nasa'),
  'Device properties': (d) => showTypeModal('device', d),
  'Link properties': (l) => showTypeModal('link', l),
  'Pool properties': (p) => showTypeModal('pool', p),
  'Connect': connectionParametersModal,
  'Automation': deviceAutomationModal,
  'Display pools': displayPools,
  'Display network': displayNetwork,
  'Enter pool': enterPool,
};

map.on('click', function(e) {
  selectedObject = null;
});

map.on('contextmenu', function() {
  if (!selectedObject) {
    $('.menu').hide();
    $(`.global-menu,.${viewMode}-menu`).show();
  }
});

$('.dropdown-submenu a.menu-submenu').on('click', function(e) {
  $(this).next('ul').toggle();
  e.stopPropagation();
  e.preventDefault();
});

$('body').contextMenu({
  menuSelector: '#contextMenu',
  menuSelected: function(invokedOn, selectedMenu) {
    const row = selectedMenu.text();
    action[row](selectedObject);
    selectedObject = null;
  },
});

(function() {
  doc('https://enms.readthedocs.io/en/latest/views/geographical_view.html');
  $('#network').hide();
  $('#pool-filter').change();
})();
