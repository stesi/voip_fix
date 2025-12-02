from odoo import api, fields, models, tools
from odoo.exceptions import UserError


class RP(models.Model):
    _inherit = 'res.partner'
    def init(self):
         self.env.cr.execute("""
        UPDATE res_partner
           SET name = 'NO NAME'
         WHERE name IS NULL
    """)
         super(RP, self).init()