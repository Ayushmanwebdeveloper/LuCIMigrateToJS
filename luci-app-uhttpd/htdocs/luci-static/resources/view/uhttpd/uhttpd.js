'use strict';
'require view';
'require form';
'require fs';

var lhttp = null
var lhttps = null
var cert_file = null
var key_file = null


return view.extend({
    render: function() {

      var m, s, o;
      m = new form.Map('uhttpd', _('uHTTPd'),
      _('A lightweight single-threaded HTTP(S) server'));
    
      ucs = m.section(form.Typedsection, 'uhttpd');
      ucs.addremove = true;
      ucs.anonymous = false;

      ucs.tab("general", _("General Settings"))
      ucs.tab("server", _("Full Web Server Settings"), _("For settings primarily geared to serving more than the web UI"))
      ucs.tab("advanced", _("Advanced Settings"), _("Settings which are either rarely needed or which affect serving the WebUI"))

      lhttp = ucs.taboption("general", form.DynamicList, "listen_http", _("HTTP listeners (address:port)"), _("Bind to specific interface:port (by specifying interface address"))
      lhttp.datatype = 'list(ipaddrport(1))'

      lhttp.validate=function(section_id, value) {
        var have_https_listener = false;
        var have_http_listener = false;
        if (lhttp && lhttp.formvalue(section_id) && (lhttp.formvalue(section_id).length > 0)) {
          lhttp.formvalue(section_id).forEach(function(v) {
            if (v && (v !== "")) {
              have_http_listener = true;
              return;
            }
          });
        }
        if (lhttps && lhttps.formvalue(section_id) && (lhttps.formvalue(section_id).length > 0)) {
          lhttps.formvalue(section_id).forEach(function(v) {
            if (v && (v !== "")) {
              have_https_listener = true;
              return;
            }
          });
        }
        if (!(have_http_listener || have_https_listener)) {
          return [null, "must listen on at least one address:port"];
        }
        return form.DynamicList.validate(section_id, value);
      }

      
      lhttps = ucs.taboption("general", form.DynamicList, "listen_https", _("HTTPS listener (address:port)"), _("Bind to specific interface:port (by specifying interface address"))
      lhttps.datatype = "list(ipaddrport(1))"
      lhttps.depends("cert")
      lhttps.depends("key")

      lhttps.validate = function(section_id, value) {
        let have_https_listener = false;
        let have_http_listener = false;
      
        if (lhttps && lhttps.formvalue(section_id) && (lhttps.formvalue(section_id).length > 0)) {
          lhttps.formvalue(section_id).forEach(function(v) {
            if (v && (v !== "")) {
              have_https_listener = true;
              return;
            }
          });
          if (have_https_listener && ((!cert_file) || (!cert_file.formvalue(section_id)) || (cert_file.formvalue(section_id) === ""))) {
            return [null, "must have certificate when using https"];
          }
          if (have_https_listener && ((!key_file) || (!key_file.formvalue(section_id)) || (key_file.formvalue(section_id) === ""))) {
            return [null, "must have key when using https"];
          }
        }
      
        if (lhttp && lhttp.formvalue(section_id) && (lhttp.formvalue(section_id).length > 0)) {
          lhttp.formvalue(section_id).forEach(function(v) {
            if (v && (v !== "")) {
              have_http_listener = true;
              return;
            }
          });
        }
      
        if (!(have_http_listener || have_https_listener)) {
          return [null, "must listen on at least one address:port"];
        }
      
        return form.DynamicList.validate(section_id, value);
      }

      o = ucs.taboption("general", form.Flag, "redirect_https", _("Redirect all HTTP to HTTPS"))
      o.default = o.enabled
      o.rmempty = false
      
      o = ucs.taboption("general", form.Flag, "rfc1918_filter", _("Ignore private IPs on public interface"), _("Prevent access from private (RFC1918) IPs on an interface if it has an public IP address"))
      o.default = o.enabled
      o.rmempty = false
      
      cert_file = ucs.taboption("general", form.FileUpload, "cert", _("HTTPS Certificate (DER or PEM format)"))
      
      key_file = ucs.taboption("general", form.FileUpload, "key", _("HTTPS Private Key (DER or PEM format)"))
      
      o = ucs.taboption("general", form.Button, "remove_old", _("Remove old certificate and key"),
            _("uHTTPd will generate a new self-signed certificate using the configuration shown below."))
      o.inputstyle = "remove"


      return m.render();
    },
  });