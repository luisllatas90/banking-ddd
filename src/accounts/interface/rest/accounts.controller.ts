import { Controller, Post, Body, Res, Get, Patch, Param } from '@nestjs/common';
import { OpenAccountRequest } from '../../application/dtos/request/open-account-request.dto';
import { OpenAccountResponse } from '../../application/dtos/response/open-account-response.dto';
import { AccountsApplicationService } from '../../application/services/accounts-application.service';
import { Result } from 'typescript-result';
import { AppNotification } from '../../../shared/application/app.notification';
import { ApiController } from '../../../shared/interface/rest/api.controller';
import { QueryBus } from '@nestjs/cqrs';
import { GetAccountById } from '../../application/messages/queries/get-account-by-id.query';
import { GetAccounts } from '../../application/messages/queries/get-accounts.query';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('accounts')
@ApiTags('accounts')
export class AccountsController {
  constructor(
    private readonly accountsApplicationService: AccountsApplicationService,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  @ApiOperation({ summary: 'Open Account' })
  async open(
    @Body() openAccountRequest: OpenAccountRequest,
    @Res({ passthrough: true }) response
  ): Promise<object> {
    try {
      const result: Result<AppNotification, OpenAccountResponse> = await this.accountsApplicationService.open(openAccountRequest);
      if (result.isSuccess()) return ApiController.created(response, result.value);
      return ApiController.error(response, result.error.getErrors());
    } catch (error) {
      return ApiController.serverError(response, error);
    }
  }

  @Get()
  async getAll(@Res({ passthrough: true }) response): Promise<object> {
    try {
      const accounts = await this.queryBus.execute(new GetAccounts());
      return ApiController.ok(response, accounts);
    } catch (error) {
      return ApiController.serverError(response, error);
    }
  }

  @Get('/:id')
  async getById(@Param('id') accountId: number, @Res({ passthrough: true }) response): Promise<object> {
    try {
      const accountDto = await this.queryBus.execute(new GetAccountById(accountId));
      return ApiController.ok(response, accountDto);
    } catch (error) {
      return ApiController.serverError(response, error);
    }
  }
}