# -*- coding: utf-8 -*-
def _pre_init_partner(env):
    env.cr.execute("""
        UPDATE res_partner
           SET name = 'NO NAME'
         WHERE name IS NULL
    """)
