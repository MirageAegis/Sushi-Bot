"""
Core moderation commands
~~~~~~~~~~~~~~~~~~~

The basic moderation commands of the bot. This module should only be loaded as a cog

:copyright: (c) 2022-present Mirage Aegis
:license: MIT, see LICENSE for more details.
"""
import discord
from discord import option
from discord.ext import commands


class ModerationCore(commands.Cog):

    KICK = 1
    BAN = 2
    UNBAN = 3

    def _embed_gen(
            self, user: discord.User | discord.Member, server: discord.Guild, cmd_type: int, reason: str
    ) -> discord.Embed:
        """
        An embed factory for kicking, banning, and unbanning users.

        :param user: The Discord user this action concerns
        :param server: The server this action is performed in
        :param cmd_type: The type of command. 1 = kick, 2 = ban, 3 = unban
        :param reason: The reason for the action
        :return: An embed formatted to fit the command and target user
        :raises ValueError: If an invalid command is specified
        """
        title: str
        colour: discord.Colour

        match cmd_type:
            case self.KICK:
                title = "Member kicked"
                colour = discord.Colour.yellow()
            case self.BAN:
                title = "Member banned"
                colour = discord.Colour.red()
            case self.UNBAN:
                title = "Member unbanned"
                colour = discord.Colour.green()
            case _:
                raise ValueError("Only 1-3 are allowed")

        e = discord.Embed(
            title=f"{user}",
            colour=colour,
        )\
            .set_author(name=title, icon_url=server.icon.url)\
            .set_thumbnail(url=user.avatar.url)\
            .add_field(name="User ID", value=f"{user.id}")\
            .add_field(name="Created", value=f"<t:{int(user.created_at.timestamp())}>")\
            .add_field(
                name="Joined",
                value=f"<t:{int(user.joined_at.timestamp())}>" if type(user) is discord.Member else "N/A"
            )\
            .add_field(name="Reason", value=f"{reason}")\
            .add_field(name="Bot user", value=f"{user.bot}")\
            .add_field(name="System user", value=f"{user.system}")

        return e

    def __init__(self, bot: discord.Bot):
        self.bot = bot

    @commands.slash_command(description="Kick a user")
    @commands.guild_only()
    @commands.has_permissions(kick_members=True)
    @option(
        "user",
        description="User to kick"
    )
    @option(
        "reason",
        description="Reason for why this member is being kicked"
    )
    @option(
        "discrete",
        description="Should the response be shown?"
    )
    async def kick(
            self, ctx: discord.ApplicationContext,
            member: discord.Member,
            reason: str = None,
            discrete: bool = False
    ):
        """
        Kicks a member from the server this command is executed in

        Requires the "Kick Members" permission.
        """
        await member.kick(reason=reason)

        e = self._embed_gen(member, ctx.guild, self.KICK, reason)

        await ctx.send_response(embed=e, ephemeral=discrete)

    @commands.slash_command(description="Ban a user")
    @commands.guild_only()
    @commands.has_permissions(ban_members=True)
    @option(
        "user",
        description="User to ban"
    )
    @option(
        "reason",
        description="Reason for why this member is being banned"
    )
    @option(
        "discrete",
        description="Should the response be shown?"
    )
    async def ban(
            self, ctx: discord.ApplicationContext,
            user: discord.User,
            reason: str = None,
            discrete: bool = False
    ):
        """
        Bans a user from the server this command is executed in

        Requires the "Ban Members" permission
        """
        await ctx.guild.ban(user, reason=reason)

        e = self._embed_gen(user, ctx.guild, self.BAN, reason)

        await ctx.send_response(embed=e, ephemeral=discrete)

    @commands.slash_command(description="Unban a user")
    @commands.guild_only()
    @commands.has_permissions(ban_members=True)
    @option(
        "user",
        description="User to unban, use their user ID"
    )
    @option(
        "reason",
        description="Reason for why this member is being unbanned"
    )
    @option(
        "discrete",
        description="Should the response be shown?"
    )
    async def unban(
            self, ctx: discord.ApplicationContext,
            user: discord.User,
            reason: str = None,
            discrete: bool = False
    ):
        """
        Unbans a user from the server this command is executed in

        Requires the "Ban Members" permission
        """
        await ctx.guild.unban(user, reason=reason)

        e = self._embed_gen(user, ctx.guild, self.UNBAN, reason)

        await ctx.send_response(embed=e, ephemeral=discrete)

    @commands.slash_command(description="Change the nickname of a member")
    @commands.has_permissions(manage_nicknames=True)
    @option(
        "member",
        description="The member to change nickname for"
    )
    @option(
        "nickname",
        description="The new nickname to be given"
    )
    @option(
        "discrete",
        description="Should the response be shown?"
    )
    async def nickname(
            self, ctx: discord.ApplicationContext,
            member: discord.Member,
            nickname: str,
            discrete: bool = None
    ):
        """
        Command allows members with the "Manage nicknames" permission to edit other members' nicknames
        so long as the target doesn't have a higher level role compared to the one executing the command

        Requires the "Manage Nicknames" permission
        """
        pre_nick = member.display_name

        await member.edit(nick=nickname)

        e = discord.Embed(
            title=f"{member}",
            colour=discord.Colour.blurple(),
        )\
            .set_author(name="Nickname changed", icon_url=ctx.guild.icon.url)\
            .set_thumbnail(url=member.avatar.url)\
            .add_field(name="User ID", value=f"{member.id}")\
            .add_field(name="Created", value=f"<t:{int(member.created_at.timestamp())}>")\
            .add_field(
                name="Joined",
                value=f"<t:{int(member.joined_at.timestamp())}>"
            )\
            .add_field(name="Changed from", value=pre_nick)\
            .add_field(name="Changed to", value=nickname)\
            .add_field(name="Bot user", value=f"{member.bot}")\
            .add_field(name="System user", value=f"{member.system}")

        await ctx.send_response(embed=e, ephemeral=discrete)

    @commands.slash_command(description="Delete messages from the current channel")
    @commands.has_permissions(manage_messages=True)
    @option(
        "amount",
        description="The amount of messages to delete",
        min_value=1,
        max_value=100
    )
    async def clear(self, ctx: discord.ApplicationContext, amount: int = 1):
        """
        Deletes a specified amount of messages from a channel (between 1 - 100)
        or a single message is no amount is specified

        Requires the "Manage Messages" permission
        """
        await ctx.channel.purge(limit=amount)
        await ctx.send_response(
            f"Deleted {amount} message{'s' if amount > 1 else ''} in this channel",
            ephemeral=True, delete_after=5
        )


def setup(bot: discord.Bot):
    bot.add_cog(ModerationCore(bot))
